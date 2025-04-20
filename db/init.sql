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

-- ============================================================================
-- END REVISED SCHEMA AND SAMPLE DATA
-- ============================================================================