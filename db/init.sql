-- ============================================================================
-- ROUND‑TABLE (Reddit‑like) DATABASE – FULL SCHEMA  ‑‑ April 2025 (REVISED)
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE "UserStatus"     AS ENUM ('active', 'suspended', 'banned');
CREATE TYPE "Gender"         AS ENUM ('male','female','non_binary','other','prefer_not_to_say');
CREATE TYPE "NotificationType" AS ENUM (
    'comment_reply','post_reply','mention','message','moderator_invite',
    'system_message','report_update','vote_post','vote_comment'
);
CREATE TYPE "MediaType"      AS ENUM ('image','video','audio');
-- single‑role flag for each Principal
CREATE TYPE "PrincipalRole"  AS ENUM ('user','admin');

-- ============================================================================
-- TABLES
-- ============================================================================

CREATE TABLE "Account" (
    "accountId"  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "username"   VARCHAR(50)  NOT NULL UNIQUE,
    "password"   VARCHAR(255) NOT NULL,
    "email"      VARCHAR(100) NOT NULL UNIQUE,
    "created"    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Profile" (
    "profileId"  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "avatar"     VARCHAR(255),
    "banner"     VARCHAR(255),
    "bio"        VARCHAR(500),
    "location"   VARCHAR(100),
    "displayName" VARCHAR(100),
    "gender"     "Gender"
);

CREATE TABLE "Principal" (
    "principalId" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "accountId"  UUID NOT NULL UNIQUE REFERENCES "Account"("accountId") ON DELETE CASCADE,
    "profileId"  UUID NOT NULL UNIQUE REFERENCES "Profile"("profileId") ON DELETE CASCADE,
    "role"       "PrincipalRole" NOT NULL -- enhancement #1: Enforces single role type
);

-- ---------- Role sub‑tables --------------------------------------------------

CREATE TABLE "RegisteredUser" (
    "userId"     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "principalId" UUID NOT NULL UNIQUE REFERENCES "Principal"("principalId") ON DELETE CASCADE,
    "karma"      INTEGER  DEFAULT 0,
    "isVerified" BOOLEAN  DEFAULT FALSE,
    "status"     "UserStatus" DEFAULT 'active',
    "lastActive" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Admin" (
    "adminId"          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "principalId"      UUID NOT NULL UNIQUE REFERENCES "Principal"("principalId") ON DELETE CASCADE,
    "grantedAt"        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------- Community -------------------------------------------------------

CREATE TABLE "Subtable" (
    "subtableId"       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name"             VARCHAR(50) UNIQUE NOT NULL,
    "description"      TEXT,
    "createdAt"        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorPrincipalId" UUID REFERENCES "Principal"("principalId") ON DELETE SET NULL,
    "icon"          VARCHAR(255),
    "banner"        VARCHAR(255),
    "memberCount"      INT DEFAULT 1 NOT NULL
);

CREATE TABLE "Moderators" ( -- composite PK
    "userId"           UUID NOT NULL REFERENCES "RegisteredUser"("userId") ON DELETE CASCADE,
    "subtableId"       UUID NOT NULL REFERENCES "Subtable"("subtableId")    ON DELETE CASCADE,
    "assignedAt"       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("userId","subtableId")
);

-- ---------- Content ---------------------------------------------------------

CREATE TABLE "Post" (
    "postId"           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "subtableId"       UUID NOT NULL REFERENCES "Subtable"("subtableId") ON DELETE CASCADE,
    "authorUserId"     UUID REFERENCES "RegisteredUser"("userId") ON DELETE SET NULL,
    "title"            VARCHAR(300) NOT NULL,
    "body"             TEXT,
    "createdAt"        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "voteCount"        INT DEFAULT 0 NOT NULL,
    "commentCount"     INT DEFAULT 0 NOT NULL,
    "isLocked"         BOOLEAN DEFAULT FALSE NOT NULL,
    "isRemoved"        BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE "Comment" (
    "commentId"        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "postId"           UUID NOT NULL REFERENCES "Post"("postId") ON DELETE CASCADE,
    "authorUserId"     UUID REFERENCES "RegisteredUser"("userId") ON DELETE SET NULL,
    "parentCommentId"  UUID REFERENCES "Comment"("commentId") ON DELETE CASCADE, -- For threaded comments
    "body"             TEXT NOT NULL,
    "createdAt"        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "voteCount"        INT DEFAULT 0 NOT NULL,
    "isRemoved"        BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE "Vote" (
    "voteId"           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "voterPrincipalId" UUID NOT NULL REFERENCES "Principal"("principalId") ON DELETE CASCADE,
    "postId"           UUID REFERENCES "Post"("postId") ON DELETE CASCADE,
    "commentId"        UUID REFERENCES "Comment"("commentId") ON DELETE CASCADE,
    "direction"        SMALLINT NOT NULL CHECK ("direction" IN (-1,1)), -- -1 for downvote, 1 for upvote
    "createdAt"        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chk_vote_target" CHECK ( -- Ensure a vote targets a post OR a comment, not both/neither
        ("postId" IS NOT NULL AND "commentId" IS NULL) OR
        ("postId" IS NULL AND "commentId" IS NOT NULL)
    )
);

CREATE TABLE "Report" (
    "reportId"            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "reporterPrincipalId" UUID NOT NULL REFERENCES "Principal"("principalId") ON DELETE CASCADE,
    "postId"              UUID REFERENCES "Post"("postId")       ON DELETE CASCADE,
    "commentId"           UUID REFERENCES "Comment"("commentId") ON DELETE CASCADE,
    "reason"              TEXT NOT NULL,
    "createdAt"           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isHandled"           BOOLEAN DEFAULT FALSE NOT NULL,
    "handlerPrincipalId"  UUID REFERENCES "Principal"("principalId") ON DELETE SET NULL, -- Moderator/Admin who handled it
    "handledAt"           TIMESTAMP,
    CONSTRAINT "chk_report_target" CHECK ( -- Ensure a report targets a post OR a comment
        ("postId" IS NOT NULL AND "commentId" IS NULL) OR
        ("postId" IS NULL AND "commentId" IS NOT NULL)
    )
);

-- ---------- Rules & Logs ----------------------------------------------------

CREATE TABLE "SystemRule" ( -- Sitewide rules
    "ruleId"           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "title"            VARCHAR(255) NOT NULL,
    "description"      TEXT NOT NULL,
    "createdAt"        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByAdminId" UUID REFERENCES "Admin"("adminId") ON DELETE SET NULL
);

CREATE TABLE "SubtableRule" ( -- Community-specific rules
    "ruleId"           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "subtableId"       UUID NOT NULL REFERENCES "Subtable"("subtableId") ON DELETE CASCADE,
    "title"            VARCHAR(255) NOT NULL,
    "description"      TEXT NOT NULL,
    "createdAt"        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorPrincipalId" UUID REFERENCES "Principal"("principalId") ON DELETE SET NULL -- Moderator or creator
);

-- ---------- Auth / Security -------------------------------------------------
-- (Password hashing and account recovery mechanisms handled application-side)

-- ---------- Messaging / Notifications --------------------------------------

CREATE TABLE "Notification" (
    "notificationId"      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "recipientAccountId"  UUID NOT NULL REFERENCES "Account"("accountId") ON DELETE CASCADE,
    "triggeringPrincipalId" UUID REFERENCES "Principal"("principalId") ON DELETE SET NULL, -- User who caused the notification
    "type"                "NotificationType" NOT NULL,
    "sourceUrl"           VARCHAR(2048), -- Link to the relevant post/comment/etc.
    "content"             TEXT, -- Optional brief content preview
    "isRead"              BOOLEAN DEFAULT FALSE NOT NULL,
    "createdAt"           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Message" ( -- Private messages
    "messageId"           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "senderPrincipalId"   UUID REFERENCES "Principal"("principalId") ON DELETE SET NULL,
    "recipientAccountId"  UUID REFERENCES "Account"("accountId")   ON DELETE SET NULL,
    "subject"             VARCHAR(255),
    "body"                TEXT NOT NULL,
    "createdAt"           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRead"              BOOLEAN DEFAULT FALSE NOT NULL,
    "senderDeleted"       BOOLEAN DEFAULT FALSE NOT NULL, -- Soft delete flags
    "recipientDeleted"    BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE "Ban" ( -- Tracks user bans (site-wide or subtable-specific)
    "banId"               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "bannedAccountId"     UUID NOT NULL REFERENCES "Account"("accountId") ON DELETE CASCADE,
    "issuerPrincipalId"   UUID NOT NULL REFERENCES "Principal"("principalId") ON DELETE SET NULL, -- Admin or Mod who issued ban
    "subtableId"          UUID REFERENCES "Subtable"("subtableId") ON DELETE CASCADE, -- NULL for site-wide ban
    "reason"              TEXT,
    "expiresAt"           TIMESTAMP, -- NULL for permanent ban
    "createdAt"           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------- Logs ------------------------------------------------------------

CREATE TABLE "ModeratorLog" ( -- Actions taken by moderators within a subtable
    "logId"                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "moderatorPrincipalId" UUID NOT NULL REFERENCES "Principal"("principalId") ON DELETE SET NULL,
    "subtableId"           UUID NOT NULL REFERENCES "Subtable"("subtableId") ON DELETE CASCADE,
    "action"               VARCHAR(100) NOT NULL, -- e.g., 'remove_post', 'ban_user'
    "targetPostId"         UUID REFERENCES "Post"("postId")       ON DELETE SET NULL,
    "targetCommentId"      UUID REFERENCES "Comment"("commentId") ON DELETE SET NULL,
    "targetAccountId"      UUID REFERENCES "Account"("accountId") ON DELETE SET NULL, -- User affected by action
    "details"              TEXT, -- Optional justification or details
    "createdAt"            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "AdminLog" ( -- Actions taken by site administrators
    "logId"                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "adminId"              UUID NOT NULL REFERENCES "Admin"("adminId") ON DELETE SET NULL,
    "action"               VARCHAR(100) NOT NULL, -- e.g., 'suspend_account', 'delete_subtable'
    "targetAccountId"      UUID REFERENCES "Account"("accountId") ON DELETE SET NULL,
    "targetSubtableId"     UUID REFERENCES "Subtable"("subtableId") ON DELETE SET NULL,
    "targetPostId"         UUID REFERENCES "Post"("postId")       ON DELETE SET NULL,
    "targetCommentId"      UUID REFERENCES "Comment"("commentId") ON DELETE SET NULL,
    "details"              TEXT,
    "createdAt"            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------- Media -----------------------------------------------------------

CREATE TABLE "Media" ( -- Stores references to uploaded media associated with posts
    "mediaId"             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "postId"              UUID NOT NULL REFERENCES "Post"("postId") ON DELETE CASCADE,
    "uploaderPrincipalId" UUID NOT NULL REFERENCES "Principal"("principalId") ON DELETE SET NULL,
    "url"                 VARCHAR(255) UNIQUE NOT NULL, -- URL to the media file (e.g., S3 link)
    "mediaType"           "MediaType" NOT NULL,
    "mimeType"            VARCHAR(50), -- e.g., 'image/jpeg', 'video/mp4'
    "fileSize"            BIGINT, -- Size in bytes
    "createdAt"           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- (Keep all CREATE INDEX statements from your original script here)
CREATE INDEX idx_account_username ON "Account"("username");
CREATE INDEX idx_account_email ON "Account"("email");
CREATE INDEX idx_principal_accountid ON "Principal"("accountId");
CREATE INDEX idx_principal_profileid ON "Principal"("profileId");
CREATE INDEX idx_registereduser_principalid ON "RegisteredUser"("principalId");
CREATE INDEX idx_admin_principalid ON "Admin"("principalId");
CREATE INDEX idx_subtable_name ON "Subtable"("name");
CREATE INDEX idx_subtable_creator ON "Subtable"("creatorPrincipalId");
CREATE INDEX idx_moderators_subtableid ON "Moderators"("subtableId");
CREATE INDEX idx_post_subtableid ON "Post"("subtableId");
CREATE INDEX idx_post_authoruserid ON "Post"("authorUserId");
CREATE INDEX idx_post_createdat ON "Post"("createdAt");
CREATE INDEX idx_comment_postid ON "Comment"("postId");
CREATE INDEX idx_comment_authoruserid ON "Comment"("authorUserId");
CREATE INDEX idx_comment_parentcommentid ON "Comment"("parentCommentId");
CREATE INDEX idx_vote_voterprincipalid ON "Vote"("voterPrincipalId");
CREATE INDEX idx_vote_postid ON "Vote"("postId");
CREATE INDEX idx_vote_commentid ON "Vote"("commentId");
CREATE INDEX idx_report_reporterprincipalid ON "Report"("reporterPrincipalId");
CREATE INDEX idx_report_postid ON "Report"("postId");
CREATE INDEX idx_report_commentid ON "Report"("commentId");
CREATE INDEX idx_report_handlerprincipalid ON "Report"("handlerPrincipalId");
CREATE INDEX idx_systemrule_createdbyadminid ON "SystemRule"("createdByAdminId");
CREATE INDEX idx_subtablerule_subtableid ON "SubtableRule"("subtableId");
CREATE INDEX idx_notification_recipientaccountid ON "Notification"("recipientAccountId");
CREATE INDEX idx_notification_triggeringprincipalid ON "Notification"("triggeringPrincipalId");
CREATE INDEX idx_message_senderprincipalid ON "Message"("senderPrincipalId");
CREATE INDEX idx_message_recipientaccountid ON "Message"("recipientAccountId");
CREATE INDEX idx_ban_bannedaccountid ON "Ban"("bannedAccountId");
CREATE INDEX idx_ban_subtableid ON "Ban"("subtableId");
CREATE INDEX idx_moderatorlog_subtableid ON "ModeratorLog"("subtableId");
CREATE INDEX idx_moderatorlog_moderatorprincipalid ON "ModeratorLog"("moderatorPrincipalId");
CREATE INDEX idx_adminlog_adminid ON "AdminLog"("adminId");
CREATE INDEX idx_media_postid ON "Media"("postId");
CREATE INDEX idx_media_uploaderprincipalid ON "Media"("uploaderPrincipalId");
-- Add indexes for new columns if needed, though usually not necessary for URL fields like avatar/banner unless searched frequently
-- CREATE INDEX idx_registereduser_avatar ON "RegisteredUser"("avatar");
-- CREATE INDEX idx_registereduser_banner ON "RegisteredUser"("banner");

-- ============================================================================
-- TRIGGER FUNCTIONS
-- ============================================================================

-- trigger_set_timestamp, trigger_update_comment_count, trigger_update_vote_count,
-- check_media_limit, enforce_principal_single_role functions remain unchanged
-- (Copy them from the previous version or your original script)

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trigger_update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE "Post" SET "commentCount" = "commentCount" + 1 WHERE "postId" = NEW."postId";
    ELSIF TG_OP = 'DELETE' THEN
        -- Avoid decrementing below zero if comments are deleted manually/directly
        UPDATE "Post" SET "commentCount" = GREATEST(0,"commentCount" - 1) WHERE "postId" = OLD."postId";
    END IF;
    RETURN NULL; -- AFTER trigger can return NULL
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trigger_update_vote_count()
RETURNS TRIGGER AS $$
DECLARE
    diff INT;
    tgt_post UUID;
    tgt_comment UUID;
BEGIN
    IF TG_OP = 'INSERT' THEN
        diff := NEW."direction";
        tgt_post := NEW."postId";
        tgt_comment := NEW."commentId";
    ELSIF TG_OP = 'DELETE' THEN
        diff := -OLD."direction";
        tgt_post := OLD."postId";
        tgt_comment := OLD."commentId";
    ELSIF TG_OP = 'UPDATE' THEN
        -- Only trigger if the direction actually changed
        IF OLD."direction" <> NEW."direction" THEN
            diff := NEW."direction" - OLD."direction"; -- e.g., change from -1 to 1 -> diff = 1 - (-1) = 2
            tgt_post := NEW."postId";
            tgt_comment := NEW."commentId";
        ELSE
            RETURN NULL; -- No change in direction, do nothing
        END IF;
    ELSE
         RETURN NULL; -- Should not happen for defined triggers
    END IF;

    -- Update the appropriate count
    IF tgt_post IS NOT NULL THEN
        UPDATE "Post" SET "voteCount" = "voteCount" + diff WHERE "postId" = tgt_post;
    ELSIF tgt_comment IS NOT NULL THEN
        UPDATE "Comment" SET "voteCount" = "voteCount" + diff WHERE "commentId" = tgt_comment;
    END IF;
    RETURN NULL; -- AFTER trigger can return NULL
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_media_limit()
RETURNS TRIGGER AS $$
DECLARE
    media_limit CONSTANT INTEGER := 3; -- Define limit clearly
    current_count INTEGER;
BEGIN
    -- Check count before inserting the new media item
    SELECT count(*) INTO current_count FROM "Media" WHERE "postId" = NEW."postId";

    IF current_count >= media_limit THEN
        RAISE EXCEPTION 'A post may have at most % media items (postId=%)', media_limit, NEW."postId"
            USING ERRCODE='check_violation', HINT='Remove existing media or upload to a different post.';
    END IF;
    RETURN NEW; -- Allow the insert operation
END;
$$ LANGUAGE plpgsql;

-- Trigger function to enforce that a Principal is either a RegisteredUser OR an Admin, but not both
CREATE OR REPLACE FUNCTION enforce_principal_single_role()
RETURNS TRIGGER AS $$
DECLARE
    principal_target_id UUID;
BEGIN
    -- Determine which table is being inserted into and get the principalId
    IF TG_TABLE_NAME = 'RegisteredUser' THEN
        principal_target_id := NEW."principalId";
        -- Check if this principal already exists in the Admin table
        IF EXISTS (SELECT 1 FROM "Admin" WHERE "principalId" = principal_target_id) THEN
            RAISE EXCEPTION 'Principal % cannot be added as RegisteredUser because they are already an Admin.', principal_target_id
                USING ERRCODE='integrity_constraint_violation', HINT='A principal must have only one role (User or Admin).';
        END IF;
    ELSIF TG_TABLE_NAME = 'Admin' THEN
        principal_target_id := NEW."principalId";
        -- Check if this principal already exists in the RegisteredUser table
        IF EXISTS (SELECT 1 FROM "RegisteredUser" WHERE "principalId" = principal_target_id) THEN
            RAISE EXCEPTION 'Principal % cannot be added as Admin because they are already a RegisteredUser.', principal_target_id
                 USING ERRCODE='integrity_constraint_violation', HINT='A principal must have only one role (User or Admin).';
        END IF;
    END IF;
    RETURN NEW; -- Allow the insert operation if no conflict
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Triggers remain unchanged
CREATE TRIGGER "set_account_timestamp"  BEFORE UPDATE ON "Account" FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER "set_post_timestamp"     BEFORE UPDATE ON "Post"    FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER "set_comment_timestamp"  BEFORE UPDATE ON "Comment" FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER "update_post_comment_count_ins" AFTER INSERT ON "Comment" FOR EACH ROW EXECUTE FUNCTION trigger_update_comment_count();
CREATE TRIGGER "update_post_comment_count_del" AFTER DELETE ON "Comment" FOR EACH ROW EXECUTE FUNCTION trigger_update_comment_count();
CREATE TRIGGER "update_vote_count_ins"  AFTER INSERT ON "Vote" FOR EACH ROW EXECUTE FUNCTION trigger_update_vote_count();
CREATE TRIGGER "update_vote_count_del"  AFTER DELETE ON "Vote" FOR EACH ROW EXECUTE FUNCTION trigger_update_vote_count();
CREATE TRIGGER "update_vote_count_upd"  AFTER UPDATE ON "Vote" FOR EACH ROW EXECUTE FUNCTION trigger_update_vote_count();
CREATE TRIGGER "enforce_media_limit" BEFORE INSERT ON "Media" FOR EACH ROW EXECUTE FUNCTION check_media_limit();
CREATE TRIGGER "enforce_single_role_user"  BEFORE INSERT ON "RegisteredUser" FOR EACH ROW EXECUTE FUNCTION enforce_principal_single_role();
CREATE TRIGGER "enforce_single_role_admin" BEFORE INSERT ON "Admin"          FOR EACH ROW EXECUTE FUNCTION enforce_principal_single_role();

-- ============================================================================
-- VIEW
-- ============================================================================

-- Provides a convenient combined view of user account and profile information (UPDATED)
CREATE OR REPLACE VIEW "UserProfile" AS
SELECT
    ru."userId",           -- ID specific to the RegisteredUser role
    p."principalId",       -- The core Principal ID linking Account and Profile
    a."username",
    pr."displayName",
    pr."avatar",           -- User's avatar
    pr."banner",           -- User's banner image
    ru."karma",            -- User's reputation score
    ru."isVerified",       -- Account verification status
    ru."status"            -- e.g., 'active', 'suspended'
FROM "RegisteredUser" ru
JOIN "Principal"      p  ON p."principalId" = ru."principalId"
JOIN "Account"        a  ON a."accountId"   = p."accountId"
JOIN "Profile"        pr ON pr."profileId"  = p."profileId";


-- Combines comment information with details about the author from UserProfile (No change needed here)
CREATE OR REPLACE VIEW "UserCommentDetails" AS
SELECT
    -- Comment Information
    c."commentId",
    c."postId",
    c."parentCommentId",
    c."body",
    c."createdAt" AS "commentCreatedAt", -- Alias
    c."updatedAt" AS "commentUpdatedAt", -- Alias
    c."voteCount",
    c."isRemoved",

    -- Author Information (from UserProfile view)
    up."userId" AS "authorUserId",              -- The RegisteredUser ID of the author
    up."principalId" AS "authorPrincipalId",    -- The Principal ID of the author
    up."username" AS "authorUsername",
    up."displayName" AS "authorDisplayName",
    up."avatar" AS "authorAvatar",
    up."karma" AS "authorKarma",
    up."isVerified" AS "authorIsVerified",
    up."status" AS "authorStatus"

FROM "Comment" c
LEFT JOIN "UserProfile" up ON c."authorUserId" = up."userId";

-- ============================================================================
-- REALISTIC SAMPLE DATA -- April 18, 2025 (REVISED)
-- ============================================================================

-- 1. Account (No change)
INSERT INTO "Account" ("accountId", "username", "password", "email")
VALUES (
    '11111111-aaaa-bbbb-cccc-111111111111',
    'sampleuser',
    'hashedpassword123', -- Ensure this is properly hashed in a real app
    'sampleuser@example.com'
);

-- 2. Profile (UPDATED: Removed avatar and banner)
INSERT INTO "Profile" ("profileId", "bio", "location", "displayName", "gender", "avatar", "banner")
VALUES (
    '22222222-aaaa-bbbb-cccc-222222222222',
    'Just a sample user who loves tech.',
    'Ho Chi Minh City',
    'Sample User',
    'male',
    'https://cdn.example.com/avatars/sample.png',
    'https://cdn.example.com/banners/sample.png'
);

-- 3. Principal (No change)
INSERT INTO "Principal" ("principalId", "accountId", "profileId", "role")
VALUES (
    '33333333-aaaa-bbbb-cccc-333333333333',
    '11111111-aaaa-bbbb-cccc-111111111111',
    '22222222-aaaa-bbbb-cccc-222222222222',
    'user'
);

-- 4. RegisteredUser (UPDATED: Added avatar and banner)
INSERT INTO "RegisteredUser" ("userId", "principalId", "karma", "isVerified")
VALUES (
    '44444444-aaaa-bbbb-cccc-444444444444',
    '33333333-aaaa-bbbb-cccc-333333333333',
    123,
    TRUE
);

-- 5. Subtable (No change)
INSERT INTO "Subtable" ("subtableId", "name", "description", "creatorPrincipalId")
VALUES (
    '55555555-aaaa-bbbb-cccc-555555555555',
    'technews',
    'A place to discuss the latest in technology',
    '33333333-aaaa-bbbb-cccc-333333333333'
);

-- 6. Post (No change)
INSERT INTO "Post" ("postId", "subtableId", "authorUserId", "title", "body")
VALUES (
    '66666666-aaaa-bbbb-cccc-666666666666',
    '55555555-aaaa-bbbb-cccc-555555555555',
    '44444444-aaaa-bbbb-cccc-444444444444',
    'AI Breakthrough: GPT-5 Released!',
    'OpenAI just released GPT-5 and it’s amazing! What are your thoughts?'
);

-- 7. Comments (No change)
INSERT INTO "Comment" ("commentId", "postId", "authorUserId", "body")
VALUES
(
    '77777777-aaaa-bbbb-cccc-777777777777',
    '66666666-aaaa-bbbb-cccc-666666666666',
    '44444444-aaaa-bbbb-cccc-444444444444',
    'I think GPT-5 will revolutionize many industries!'
),
(
    '88888888-aaaa-bbbb-cccc-888888888888',
    '66666666-aaaa-bbbb-cccc-666666666666',
    '44444444-aaaa-bbbb-cccc-444444444444',
    'Let’s hope it’s used ethically this time.'
);

INSERT INTO "Comment" ("commentId", "postId", "authorUserId", "parentCommentId", "body")
VALUES
(
    'eeeeeeee-aaaa-bbbb-cccc-eeeeeeeeeeee',
    '66666666-aaaa-bbbb-cccc-666666666666',
    '44444444-aaaa-bbbb-cccc-444444444444',
    '77777777-aaaa-bbbb-cccc-777777777777',
    'Totally agree. Especially in healthcare and finance.'
),
(
    'ffffffff-aaaa-bbbb-cccc-ffffffffffff',
    '66666666-aaaa-bbbb-cccc-666666666666',
    '44444444-aaaa-bbbb-cccc-444444444444',
    '88888888-aaaa-bbbb-cccc-888888888888',
    'OpenAI claims better alignment this time. Let’s see...'
);

-- -------------------------------------------------------------------
-- 1) Accounts (10 records)
-- -------------------------------------------------------------------
INSERT INTO "Account" ("accountId","username","password","email") VALUES
  ('00000000-0000-0000-0000-000000000001','user1','password1','user1@example.com'),
  ('00000000-0000-0000-0000-000000000002','user2','password2','user2@example.com'),
  ('00000000-0000-0000-0000-000000000003','user3','password3','user3@example.com'),
  ('00000000-0000-0000-0000-000000000004','user4','password4','user4@example.com'),
  ('00000000-0000-0000-0000-000000000005','user5','password5','user5@example.com'),
  ('00000000-0000-0000-0000-000000000006','admin1','password6','admin1@example.com'),
  ('00000000-0000-0000-0000-000000000007','admin2','password7','admin2@example.com'),
  ('00000000-0000-0000-0000-000000000008','admin3','password8','admin3@example.com'),
  ('00000000-0000-0000-0000-000000000009','admin4','password9','admin4@example.com'),
  ('00000000-0000-0000-0000-000000000010','admin5','password10','admin5@example.com')
;

-- -------------------------------------------------------------------
-- 2) Profiles (10 records)
-- -------------------------------------------------------------------
INSERT INTO "Profile" ("profileId","avatar","banner","bio","location","displayName","gender") VALUES
  ('00000000-0000-0000-0000-000000000011','https://example.com/avatars/user1.png','https://example.com/banners/user1.png','Hi, I am user1!','City1','User One','male'),
  ('00000000-0000-0000-0000-000000000012','https://example.com/avatars/user2.png','https://example.com/banners/user2.png','Passionate coder.','City2','User Two','female'),
  ('00000000-0000-0000-0000-000000000013','https://example.com/avatars/user3.png','https://example.com/banners/user3.png','Coffee addict.','City3','User Three','non_binary'),
  ('00000000-0000-0000-0000-000000000014','https://example.com/avatars/user4.png','https://example.com/banners/user4.png','Love open source.','City4','User Four','other'),
  ('00000000-0000-0000-0000-000000000015','https://example.com/avatars/user5.png','https://example.com/banners/user5.png','Tech enthusiast.','City5','User Five','prefer_not_to_say'),
  ('00000000-0000-0000-0000-000000000016','https://example.com/avatars/admin1.png','https://example.com/banners/admin1.png','I handle reports.','City1','Admin One','female'),
  ('00000000-0000-0000-0000-000000000017','https://example.com/avatars/admin2.png','https://example.com/banners/admin2.png','System steward.','City2','Admin Two','male'),
  ('00000000-0000-0000-0000-000000000018','https://example.com/avatars/admin3.png','https://example.com/banners/admin3.png','Core maintainer.','City3','Admin Three','non_binary'),
  ('00000000-0000-0000-0000-000000000019','https://example.com/avatars/admin4.png','https://example.com/banners/admin4.png','Moderator lead.','City4','Admin Four','other'),
  ('00000000-0000-0000-0000-000000000020','https://example.com/avatars/admin5.png','https://example.com/banners/admin5.png','I manage the community.','City5','Admin Five','prefer_not_to_say')
;

-- -------------------------------------------------------------------
-- 3) Principals (10 records: first 5 users, next 5 admins)
-- -------------------------------------------------------------------
INSERT INTO "Principal" ("principalId","accountId","profileId","role") VALUES
  -- user principals
  ('00000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000011','user'),
  ('00000000-0000-0000-0000-000000000022','00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000012','user'),
  ('00000000-0000-0000-0000-000000000023','00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000013','user'),
  ('00000000-0000-0000-0000-000000000024','00000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000014','user'),
  ('00000000-0000-0000-0000-000000000025','00000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000015','user'),
  -- admin principals
  ('00000000-0000-0000-0000-000000000026','00000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000016','admin'),
  ('00000000-0000-0000-0000-000000000027','00000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000017','admin'),
  ('00000000-0000-0000-0000-000000000028','00000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000018','admin'),
  ('00000000-0000-0000-0000-000000000029','00000000-0000-0000-0000-000000000009','00000000-0000-0000-0000-000000000019','admin'),
  ('00000000-0000-0000-0000-000000000030','00000000-0000-0000-0000-000000000010','00000000-0000-0000-0000-000000000020','admin')
;

-- -------------------------------------------------------------------
-- 4) RegisteredUser (5 records for the 5 ‘user’ principals)
-- -------------------------------------------------------------------
INSERT INTO "RegisteredUser" ("userId","principalId","karma","isVerified","status","lastActive") VALUES
  ('00000000-0000-0000-0000-000000000031','00000000-0000-0000-0000-000000000021',  10, TRUE,  'active',    '2025-04-20 09:00:00'),
  ('00000000-0000-0000-0000-000000000032','00000000-0000-0000-0000-000000000022',  20, FALSE, 'suspended','2025-04-19 15:30:00'),
  ('00000000-0000-0000-0000-000000000033','00000000-0000-0000-0000-000000000023',   5, TRUE,  'active',    '2025-04-18 12:00:00'),
  ('00000000-0000-0000-0000-000000000034','00000000-0000-0000-0000-000000000024',   0, FALSE, 'banned',    '2025-04-17 08:45:00'),
  ('00000000-0000-0000-0000-000000000035','00000000-0000-0000-0000-000000000025', 100, TRUE,  'active',    '2025-04-20 11:15:00')
;

-- -------------------------------------------------------------------
-- 5) Admin (5 records for the 5 ‘admin’ principals)
-- -------------------------------------------------------------------
INSERT INTO "Admin" ("adminId","principalId","grantedAt") VALUES
  ('00000000-0000-0000-0000-000000000036','00000000-0000-0000-0000-000000000026','2025-04-01 10:00:00'),
  ('00000000-0000-0000-0000-000000000037','00000000-0000-0000-0000-000000000027','2025-03-15 14:20:00'),
  ('00000000-0000-0000-0000-000000000038','00000000-0000-0000-0000-000000000028','2025-02-28 08:00:00'),
  ('00000000-0000-0000-0000-000000000039','00000000-0000-0000-0000-000000000029','2025-04-18 16:45:00'),
  ('00000000-0000-0000-0000-000000000040','00000000-0000-0000-0000-000000000030','2025-04-20 10:30:00')
;


-- -------------------------------------------------------------------
-- 1) Subtables (5 records)
-- -------------------------------------------------------------------
INSERT INTO "Subtable" (
  "subtableId","name","description","creatorPrincipalId","icon","banner","memberCount"
) VALUES
  ('00000000-0000-0000-0000-000000000041','AskAnything','A place for any question','00000000-0000-0000-0000-000000000026','https://example.com/icons/ask.png','https://example.com/banners/ask.png',100),
  ('00000000-0000-0000-0000-000000000042','TechTalk','Discussions about technology','00000000-0000-0000-0000-000000000027','https://example.com/icons/tech.png','https://example.com/banners/tech.png',200),
  ('00000000-0000-0000-0000-000000000043','NewsHub','Share and discuss news','00000000-0000-0000-0000-000000000028','https://example.com/icons/news.png','https://example.com/banners/news.png',150),
  ('00000000-0000-0000-0000-000000000044','AnimeClub','For anime fans','00000000-0000-0000-0000-000000000029','https://example.com/icons/anime.png','https://example.com/banners/anime.png',80),
  ('00000000-0000-0000-0000-000000000045','Foodies','Food recipes and reviews','00000000-0000-0000-0000-000000000030','https://example.com/icons/food.png','https://example.com/banners/food.png',120)
;

-- -------------------------------------------------------------------
-- 2) Moderators (5 records)
-- -------------------------------------------------------------------
INSERT INTO "Moderators" ("userId","subtableId") VALUES
  ('00000000-0000-0000-0000-000000000031','00000000-0000-0000-0000-000000000041'),
  ('00000000-0000-0000-0000-000000000032','00000000-0000-0000-0000-000000000042'),
  ('00000000-0000-0000-0000-000000000033','00000000-0000-0000-0000-000000000043'),
  ('00000000-0000-0000-0000-000000000034','00000000-0000-0000-0000-000000000044'),
  ('00000000-0000-0000-0000-000000000035','00000000-0000-0000-0000-000000000045')
;

-- -------------------------------------------------------------------
-- 3) Posts (10 records)
-- -------------------------------------------------------------------
INSERT INTO "Post" ("postId","subtableId","authorUserId","title","body") VALUES
  ('00000000-0000-0000-0000-000000000051','00000000-0000-0000-0000-000000000041','00000000-0000-0000-0000-000000000031','Welcome to AskAnything','Feel free to ask any questions here.'),
  ('00000000-0000-0000-0000-000000000052','00000000-0000-0000-0000-000000000041','00000000-0000-0000-0000-000000000032','Question about SQL','How do I write a JOIN query?'),
  ('00000000-0000-0000-0000-000000000053','00000000-0000-0000-0000-000000000042','00000000-0000-0000-0000-000000000033','Latest tech trends','Let’s talk about AI advancements.'),
  ('00000000-0000-0000-0000-000000000054','00000000-0000-0000-0000-000000000042','00000000-0000-0000-0000-000000000034','JavaScript vs TypeScript','Which one is better?'),
  ('00000000-0000-0000-0000-000000000055','00000000-0000-0000-0000-000000000043','00000000-0000-0000-0000-000000000035','Breaking news','Major event happened today.'),
  ('00000000-0000-0000-0000-000000000056','00000000-0000-0000-0000-000000000043','00000000-0000-0000-0000-000000000031','News sources','Where do you get your news?'),
  ('00000000-0000-0000-0000-000000000057','00000000-0000-0000-0000-000000000044','00000000-0000-0000-0000-000000000032','Favorite anime','What’s your favorite series?'),
  ('00000000-0000-0000-0000-000000000058','00000000-0000-0000-0000-000000000044','00000000-0000-0000-0000-000000000033','Anime recommendations','Suggest some good anime.'),
  ('00000000-0000-0000-0000-000000000059','00000000-0000-0000-0000-000000000045','00000000-0000-0000-0000-000000000034','Best recipes','Share your recipe tips.'),
  ('00000000-0000-0000-0000-000000000060','00000000-0000-0000-0000-000000000045','00000000-0000-0000-0000-000000000035','Food photography','How to take food photos?')
;

-- -------------------------------------------------------------------
-- 4) Comments (15 records)
-- -------------------------------------------------------------------
INSERT INTO "Comment" ("commentId","postId","authorUserId","parentCommentId","body") VALUES
  ('00000000-0000-0000-0000-000000000061','00000000-0000-0000-0000-000000000051','00000000-0000-0000-0000-000000000032',NULL,'Thanks for the welcome!'),
  ('00000000-0000-0000-0000-000000000062','00000000-0000-0000-0000-000000000051','00000000-0000-0000-0000-000000000033',NULL,'Glad to be here.'),
  ('00000000-0000-0000-0000-000000000063','00000000-0000-0000-0000-000000000052','00000000-0000-0000-0000-000000000031',NULL,'Use INNER JOIN for matching rows.'),
  ('00000000-0000-0000-0000-000000000064','00000000-0000-0000-0000-000000000052','00000000-0000-0000-0000-000000000034',NULL,'LEFT JOIN might help if some values are missing.'),
  ('00000000-0000-0000-0000-000000000065','00000000-0000-0000-0000-000000000053','00000000-0000-0000-0000-000000000035',NULL,'AI is amazing!'),
  ('00000000-0000-0000-0000-000000000066','00000000-0000-0000-0000-000000000054','00000000-0000-0000-0000-000000000031',NULL,'TS gives you static types.'),
  ('00000000-0000-0000-0000-000000000067','00000000-0000-0000-0000-000000000054','00000000-0000-0000-0000-000000000035',NULL,'JS is more flexible though.'),
  ('00000000-0000-0000-0000-000000000068','00000000-0000-0000-0000-000000000055','00000000-0000-0000-0000-000000000032',NULL,'What happened?'),
  ('00000000-0000-0000-0000-000000000069','00000000-0000-0000-0000-000000000056','00000000-0000-0000-0000-000000000033',NULL,'I read BBC daily.'),
  ('00000000-0000-0000-0000-000000000070','00000000-0000-0000-0000-000000000057','00000000-0000-0000-0000-000000000034',NULL,'My favorite is Naruto.'),
  ('00000000-0000-0000-0000-000000000071','00000000-0000-0000-0000-000000000058','00000000-0000-0000-0000-000000000031',NULL,'Try Attack on Titan.'),
  ('00000000-0000-0000-0000-000000000072','00000000-0000-0000-0000-000000000059','00000000-0000-0000-0000-000000000032',NULL,'I love pasta recipes.'),
  ('00000000-0000-0000-0000-000000000073','00000000-0000-0000-0000-000000000060','00000000-0000-0000-0000-000000000033',NULL,'Use natural light for food shots.'),
  ('00000000-0000-0000-0000-000000000074','00000000-0000-0000-0000-000000000060','00000000-0000-0000-0000-000000000034','00000000-0000-0000-0000-000000000073','Great tip, thanks!'),
  ('00000000-0000-0000-0000-000000000075','00000000-0000-0000-0000-000000000058','00000000-0000-0000-0000-000000000035','00000000-0000-0000-0000-000000000071','Yep, that anime is awesome.')
;

-- Reply to comment '000...63' ("Use INNER JOIN...") on post '000...52' ("Question about SQL")
INSERT INTO "Comment" ("commentId", "postId", "authorUserId", "parentCommentId", "body") VALUES
(
    '00000000-0000-0000-0000-000000000201', -- New UUID for this reply
    '00000000-0000-0000-0000-000000000052', -- Post ID
    '00000000-0000-0000-0000-000000000034', -- authorUserId (user4)
    '00000000-0000-0000-0000-000000000063', -- parentCommentId
    'Good point. What about OUTER JOINs then?'
);

-- Reply to comment '000...65' ("AI is amazing!") on post '000...53' ("Latest tech trends")
INSERT INTO "Comment" ("commentId", "postId", "authorUserId", "parentCommentId", "body") VALUES
(
    '00000000-0000-0000-0000-000000000202', -- New UUID for this reply
    '00000000-0000-0000-0000-000000000053', -- Post ID
    '00000000-0000-0000-0000-000000000031', -- authorUserId (user1)
    '00000000-0000-0000-0000-000000000065', -- parentCommentId
    'Totally agree! Scares me a little too, though.'
);

-- Reply to comment '000...67' ("JS is more flexible though.") on post '000...54' ("JavaScript vs TypeScript")
INSERT INTO "Comment" ("commentId", "postId", "authorUserId", "parentCommentId", "body") VALUES
(
    '00000000-0000-0000-0000-000000000203', -- New UUID for this reply
    '00000000-0000-0000-0000-000000000054', -- Post ID
    '00000000-0000-0000-0000-000000000033', -- authorUserId (user3)
    '00000000-0000-0000-0000-000000000067', -- parentCommentId
    'Flexibility vs. safety, the eternal debate! I prefer the safety net TS provides for larger projects.'
);

-- Reply to comment '000...70' ("My favorite is Naruto.") on post '000...57' ("Favorite anime")
INSERT INTO "Comment" ("commentId", "postId", "authorUserId", "parentCommentId", "body") VALUES
(
    '00000000-0000-0000-0000-000000000204', -- New UUID for this reply
    '00000000-0000-0000-0000-000000000057', -- Post ID
    '00000000-0000-0000-0000-000000000035', -- authorUserId (user5)
    '00000000-0000-0000-0000-000000000070', -- parentCommentId
    'Naruto is great! Have you watched Fullmetal Alchemist: Brotherhood?'
);

-- Reply to comment '000...72' ("I love pasta recipes.") on post '000...59' ("Best recipes")
INSERT INTO "Comment" ("commentId", "postId", "authorUserId", "parentCommentId", "body") VALUES
(
    '00000000-0000-0000-0000-000000000205', -- New UUID for this reply
    '00000000-0000-0000-0000-000000000059', -- Post ID
    '00000000-0000-0000-0000-000000000031', -- authorUserId (user1)
    '00000000-0000-0000-0000-000000000072', -- parentCommentId
    'Me too! Especially a good lasagna. Takes time but worth it.'
);

-- -------------------------------------------------------------------
-- 5) Votes (20 records)
-- -------------------------------------------------------------------
INSERT INTO "Vote" ("voteId","voterPrincipalId","postId","commentId","direction") VALUES
  ('00000000-0000-0000-0000-000000000076','00000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000051',NULL,  1),
  ('00000000-0000-0000-0000-000000000077','00000000-0000-0000-0000-000000000022','00000000-0000-0000-0000-000000000051',NULL,  1),
  ('00000000-0000-0000-0000-000000000078','00000000-0000-0000-0000-000000000023','00000000-0000-0000-0000-000000000052',NULL, -1),
  ('00000000-0000-0000-0000-000000000079','00000000-0000-0000-0000-000000000024','00000000-0000-0000-0000-000000000053',NULL,  1),
  ('00000000-0000-0000-0000-000000000080','00000000-0000-0000-0000-000000000025','00000000-0000-0000-0000-000000000054',NULL,  1),
  ('00000000-0000-0000-0000-000000000081','00000000-0000-0000-0000-000000000026',NULL,'00000000-0000-0000-0000-000000000061', 1),
  ('00000000-0000-0000-0000-000000000082','00000000-0000-0000-0000-000000000027',NULL,'00000000-0000-0000-0000-000000000062', 1),
  ('00000000-0000-0000-0000-000000000083','00000000-0000-0000-0000-000000000028',NULL,'00000000-0000-0000-0000-000000000063',-1),
  ('00000000-0000-0000-0000-000000000084','00000000-0000-0000-0000-000000000029',NULL,'00000000-0000-0000-0000-000000000074', 1),
  ('00000000-0000-0000-0000-000000000085','00000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000055',NULL, -1),
  ('00000000-0000-0000-0000-000000000086','00000000-0000-0000-0000-000000000022','00000000-0000-0000-0000-000000000056',NULL,  1),
  ('00000000-0000-0000-0000-000000000087','00000000-0000-0000-0000-000000000023','00000000-0000-0000-0000-000000000057',NULL,  1),
  ('00000000-0000-0000-0000-000000000088','00000000-0000-0000-0000-000000000024','00000000-0000-0000-0000-000000000058',NULL, -1),
  ('00000000-0000-0000-0000-000000000089','00000000-0000-0000-0000-000000000025','00000000-0000-0000-0000-000000000059',NULL,  1),
  ('00000000-0000-0000-0000-000000000090','00000000-0000-0000-0000-000000000026','00000000-0000-0000-0000-000000000060',NULL,  1),
  ('00000000-0000-0000-0000-000000000091','00000000-0000-0000-0000-000000000027',NULL,'00000000-0000-0000-0000-000000000065', 1),
  ('00000000-0000-0000-0000-000000000092','00000000-0000-0000-0000-000000000028',NULL,'00000000-0000-0000-0000-000000000068',-1),
  ('00000000-0000-0000-0000-000000000093','00000000-0000-0000-0000-000000000029',NULL,'00000000-0000-0000-0000-000000000069', 1),
  ('00000000-0000-0000-0000-000000000094','00000000-0000-0000-0000-000000000030',NULL,'00000000-0000-0000-0000-000000000070', 1),
  ('00000000-0000-0000-0000-000000000095','00000000-0000-0000-0000-000000000021',NULL,'00000000-0000-0000-0000-000000000071',-1)
;

-- -------------------------------------------------------------------
-- 6) Reports (3 records)
-- -------------------------------------------------------------------
INSERT INTO "Report" ("reportId","reporterPrincipalId","postId","commentId","reason") VALUES
  ('00000000-0000-0000-0000-000000000096','00000000-0000-0000-0000-000000000023','00000000-0000-0000-0000-000000000053',NULL,'Spam content'),
  ('00000000-0000-0000-0000-000000000097','00000000-0000-0000-0000-000000000024',NULL,'00000000-0000-0000-0000-000000000064','Offensive language'),
  ('00000000-0000-0000-0000-000000000098','00000000-0000-0000-0000-000000000025',NULL,'00000000-0000-0000-0000-000000000074','Harassment')
;

-- -------------------------------------------------------------------
-- 7) SystemRules (5 records)
-- -------------------------------------------------------------------
INSERT INTO "SystemRule" ("ruleId","title","description","createdByAdminId") VALUES
  ('00000000-0000-0000-0000-000000000101','Be respectful','Do not harass other users.','00000000-0000-0000-0000-000000000036'),
  ('00000000-0000-0000-0000-000000000102','No spam','Avoid posting spammy content.','00000000-0000-0000-0000-000000000037'),
  ('00000000-0000-0000-0000-000000000103','Use proper channels','Post in the correct community.','00000000-0000-0000-0000-000000000038'),
  ('00000000-0000-0000-0000-000000000104','No impersonation','Do not impersonate others.','00000000-0000-0000-0000-000000000039'),
  ('00000000-0000-0000-0000-000000000105','Follow guidelines','Abide by sitewide policies.','00000000-0000-0000-0000-000000000040')
;

-- -------------------------------------------------------------------
-- 8) SubtableRules (5 records)
-- -------------------------------------------------------------------
INSERT INTO "SubtableRule" ("ruleId","subtableId","title","description","creatorPrincipalId") VALUES
  ('00000000-0000-0000-0000-000000000106','00000000-0000-0000-0000-000000000041','No self-promo','Do not promote your own products.','00000000-0000-0000-0000-000000000026'),
  ('00000000-0000-0000-0000-000000000107','00000000-0000-0000-0000-000000000042','Tech news only','Only post tech-related news.','00000000-0000-0000-0000-000000000027'),
  ('00000000-0000-0000-0000-000000000108','00000000-0000-0000-0000-000000000043','Verify sources','Provide credible sources for news.','00000000-0000-0000-0000-000000000028'),
  ('00000000-0000-0000-0000-000000000109','00000000-0000-0000-0000-000000000044','Spoiler policy','Use spoiler tags for spoilers.','00000000-0000-0000-0000-000000000029'),
  ('00000000-0000-0000-0000-000000000110','00000000-0000-0000-0000-000000000045','Recipe format','Follow the standard recipe format.','00000000-0000-0000-0000-000000000030')
;

-- -------------------------------------------------------------------
-- 9) Notifications (5 records)
-- -------------------------------------------------------------------
INSERT INTO "Notification" (
  "notificationId","recipientAccountId","triggeringPrincipalId","type","sourceUrl","content"
) VALUES
  ('00000000-0000-0000-0000-000000000111','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000022','comment_reply','/posts/00000000-0000-0000-0000-000000000052#comment-00000000-0000-0000-0000-000000000064','Someone replied to your comment'),
  ('00000000-0000-0000-0000-000000000112','00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000023','post_reply','/posts/00000000-0000-0000-0000-000000000053#comment-00000000-0000-0000-0000-000000000065','New comment on your post'),
  ('00000000-0000-0000-0000-000000000113','00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000024','mention','/posts/00000000-0000-0000-0000-000000000054','You were mentioned in a post'),
  ('00000000-0000-0000-0000-000000000114','00000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000025','vote_comment','/posts/00000000-0000-0000-0000-000000000051#comment-00000000-0000-0000-0000-000000000061','Your comment received a new vote'),
  ('00000000-0000-0000-0000-000000000115','00000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000026','moderator_invite','/subtables/00000000-0000-0000-0000-000000000041','You have been invited as a moderator')
;

-- -------------------------------------------------------------------
-- 10) Messages (20 records)
-- -------------------------------------------------------------------
INSERT INTO "Message" (
  "messageId","senderPrincipalId","recipientAccountId","subject","body"
) VALUES
  ('00000000-0000-0000-0000-000000000116','00000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000006','Hello','Hi Admin, I have a question.'),
  ('00000000-0000-0000-0000-000000000117','00000000-0000-0000-0000-000000000022','00000000-0000-0000-0000-000000000007','Re: Hello','Sure, how can I help?'),
  ('00000000-0000-0000-0000-000000000118','00000000-0000-0000-0000-000000000023','00000000-0000-0000-0000-000000000008','Issue','I found a bug in the forum.'),
  ('00000000-0000-0000-0000-000000000119','00000000-0000-0000-0000-000000000026','00000000-0000-0000-0000-000000000001','Re: Issue','Thanks for reporting, we’ll look into it.'),
  ('00000000-0000-0000-0000-000000000120','00000000-0000-0000-0000-000000000024','00000000-0000-0000-0000-000000000009','Question','Can I post images?'),
  ('00000000-0000-0000-0000-000000000121','00000000-0000-0000-0000-000000000027','00000000-0000-0000-0000-000000000002','Re: Question','Yes, you can upload media.'),
  ('00000000-0000-0000-0000-000000000122','00000000-0000-0000-0000-000000000025','00000000-0000-0000-0000-000000000003','Greetings','Welcome to the community!'),
  ('00000000-0000-0000-0000-000000000123','00000000-0000-0000-0000-000000000028','00000000-0000-0000-0000-000000000004','Re: Greetings','Thank you! Happy to be here.'),
  ('00000000-0000-0000-0000-000000000124','00000000-0000-0000-0000-000000000029','00000000-0000-0000-0000-000000000005','Reminder','Don’t forget the meeting tomorrow.'),
  ('00000000-0000-0000-0000-000000000125','00000000-0000-0000-0000-000000000030','00000000-0000-0000-0000-000000000001','Re: Reminder','Got it, thanks.'),
  ('00000000-0000-0000-0000-000000000126','00000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000007','Question','How do I change my password?'),
  ('00000000-0000-0000-0000-000000000127','00000000-0000-0000-0000-000000000027','00000000-0000-0000-0000-000000000002','Re: Question','Go to account settings.'),
  ('00000000-0000-0000-0000-000000000128','00000000-0000-0000-0000-000000000023','00000000-0000-0000-0000-000000000008','Feedback','Love the new UI!'),
  ('00000000-0000-0000-0000-000000000129','00000000-0000-0000-0000-000000000026','00000000-0000-0000-0000-000000000003','Re: Feedback','Glad you like it.'),
  ('00000000-0000-0000-0000-000000000130','00000000-0000-0000-0000-000000000024','00000000-0000-0000-0000-000000000010','Hello','Hi there!'),
  ('00000000-0000-0000-0000-000000000131','00000000-0000-0000-0000-000000000028','00000000-0000-0000-0000-000000000001','Re: Hello','Hello back!'),
  ('00000000-0000-0000-0000-000000000132','00000000-0000-0000-0000-000000000025','00000000-0000-0000-0000-000000000006','Alert','Your account has new privileges.'),
  ('00000000-0000-0000-0000-000000000133','00000000-0000-0000-0000-000000000027','00000000-0000-0000-0000-000000000003','Re: Alert','Thanks for the update.'),
  ('00000000-0000-0000-0000-000000000134','00000000-0000-0000-0000-000000000028','00000000-0000-0000-0000-000000000005','Question','Where can I find docs?'),
  ('00000000-0000-0000-0000-000000000135','00000000-0000-0000-0000-000000000029','00000000-0000-0000-0000-000000000004','Re: Question','See the help center.')
;

-- -------------------------------------------------------------------
-- 11) Bans (5 records)
-- -------------------------------------------------------------------
INSERT INTO "Ban" (
  "banId","bannedAccountId","issuerPrincipalId","subtableId","reason","expiresAt"
) VALUES
  ('00000000-0000-0000-0000-000000000136','00000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000029',NULL,'Violation of terms','2025-05-01 00:00:00'),
  ('00000000-0000-0000-0000-000000000137','00000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000030','00000000-0000-0000-0000-000000000044','Spamming','2025-04-25 12:00:00'),
  ('00000000-0000-0000-0000-000000000138','00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000026',NULL,'Harassment',NULL),
  ('00000000-0000-0000-0000-000000000139','00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000027','00000000-0000-0000-0000-000000000042','Off-topic posts','2025-04-30 08:00:00'),
  ('00000000-0000-0000-0000-000000000140','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000028',NULL,'Multiple accounts',NULL)
;

-- -------------------------------------------------------------------
-- 12) ModeratorLogs (5 records)
-- -------------------------------------------------------------------
INSERT INTO "ModeratorLog" (
  "logId","moderatorPrincipalId","subtableId","action","targetPostId","targetCommentId","targetAccountId","details"
) VALUES
  ('00000000-0000-0000-0000-000000000141','00000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000041','remove_post','00000000-0000-0000-0000-000000000052',NULL,NULL,'Inappropriate content'),
  ('00000000-0000-0000-0000-000000000142','00000000-0000-0000-0000-000000000022','00000000-0000-0000-0000-000000000042','ban_user',NULL,NULL,'00000000-0000-0000-0000-000000000004','Repeated spam'),
  ('00000000-0000-0000-0000-000000000143','00000000-0000-0000-0000-000000000023','00000000-0000-0000-0000-000000000043','approve_comment',NULL,'00000000-0000-0000-0000-000000000064',NULL,'Looks good'),
  ('00000000-0000-0000-0000-000000000144','00000000-0000-0000-0000-000000000024','00000000-0000-0000-0000-000000000044','unban_user',NULL,NULL,'00000000-0000-0000-0000-000000000004','Time served'),
  ('00000000-0000-0000-0000-000000000145','00000000-0000-0000-0000-000000000025','00000000-0000-0000-0000-000000000045','lock_post','00000000-0000-0000-0000-000000000060',NULL,NULL,'Closed discussion')
;

-- -------------------------------------------------------------------
-- 13) AdminLogs (5 records)
-- -------------------------------------------------------------------
INSERT INTO "AdminLog" (
  "logId","adminId","action","targetAccountId","targetSubtableId","targetPostId","targetCommentId","details"
) VALUES
  ('00000000-0000-0000-0000-000000000146','00000000-0000-0000-0000-000000000036','suspend_account','00000000-0000-0000-0000-000000000005',NULL,NULL,NULL,'Policy violation'),
  ('00000000-0000-0000-0000-000000000147','00000000-0000-0000-0000-000000000037','delete_subtable',NULL,'00000000-0000-0000-0000-000000000045',NULL,NULL,'Obsolete community'),
  ('00000000-0000-0000-0000-000000000148','00000000-0000-0000-0000-000000000038','grant_admin','00000000-0000-0000-0000-000000000010',NULL,NULL,NULL,'Promoted user to admin'),
  ('00000000-0000-0000-0000-000000000149','00000000-0000-0000-0000-000000000039','modify_subtable',NULL,'00000000-0000-0000-0000-000000000042',NULL,NULL,'Updated description'),
  ('00000000-0000-0000-0000-000000000150','00000000-0000-0000-0000-000000000040','delete_post',NULL,NULL,'00000000-0000-0000-0000-000000000055',NULL,'User request')
;

-- -------------------------------------------------------------------
-- 14) Media (5 records)
-- -------------------------------------------------------------------
INSERT INTO "Media" (
  "mediaId","postId","uploaderPrincipalId","url","mediaType","mimeType","fileSize"
) VALUES
  ('00000000-0000-0000-0000-000000000151','00000000-0000-0000-0000-000000000051','00000000-0000-0000-0000-000000000021','https://cdn.example.com/media/1.jpg','image','image/jpeg',204800),
  ('00000000-0000-0000-0000-000000000152','00000000-0000-0000-0000-000000000052','00000000-0000-0000-0000-000000000022','https://cdn.example.com/media/2.png','image','image/png',102400),
  ('00000000-0000-0000-0000-000000000153','00000000-0000-0000-0000-000000000053','00000000-0000-0000-0000-000000000023','https://cdn.example.com/media/3.mp4','video','video/mp4',10485760),
  ('00000000-0000-0000-0000-000000000154','00000000-0000-0000-0000-000000000054','00000000-0000-0000-0000-000000000024','https://cdn.example.com/media/4.mov','video','video/quicktime',20971520),
  ('00000000-0000-0000-0000-000000000155','00000000-0000-0000-0000-000000000055','00000000-0000-0000-0000-000000000025','https://cdn.example.com/media/5.gif','image','image/gif',51200)
;


-- ============================================================================
-- END REVISED SCHEMA AND SAMPLE DATA
-- ============================================================================