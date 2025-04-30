CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE "UserStatus"       AS ENUM ('active', 'suspended', 'banned');
CREATE TYPE "Gender"           AS ENUM ('male','female','non_binary','other','prefer_not_to_say');
CREATE TYPE "NotificationType" AS ENUM (
    'comment_reply','post_reply','mention','message','moderator_invite',
    'system_message','report_update','vote_post','vote_comment'
);
CREATE TYPE "MediaType"        AS ENUM ('image','video','audio');
CREATE TYPE "PrincipalRole"    AS ENUM ('user','admin');
CREATE TYPE "VoteType"         AS ENUM ('upvote', 'downvote');

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
    "role"       "PrincipalRole" NOT NULL
);

CREATE TABLE "RegisteredUser" (
    "userId"      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "principalId" UUID NOT NULL UNIQUE REFERENCES "Principal"("principalId") ON DELETE CASCADE,
    "karma"       INTEGER  DEFAULT 0,
    "isVerified" BOOLEAN  DEFAULT FALSE,
    "status"      "UserStatus" DEFAULT 'active',
    "lastActive" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Admin" (
    "adminId"         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "principalId"     UUID NOT NULL UNIQUE REFERENCES "Principal"("principalId") ON DELETE CASCADE,
    "grantedAt"       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Subtable" (
    "subtableId"         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name"               VARCHAR(50) UNIQUE NOT NULL,
    "description"        TEXT,
    "createdAt"          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorPrincipalId" UUID REFERENCES "Principal"("principalId") ON DELETE SET NULL,
    "icon"            VARCHAR(255),
    "banner"          VARCHAR(255),
    "memberCount"        INT DEFAULT 1 NOT NULL
);

CREATE TABLE "Moderators" (
    "userId"           UUID NOT NULL REFERENCES "RegisteredUser"("userId") ON DELETE CASCADE,
    "subtableId"       UUID NOT NULL REFERENCES "Subtable"("subtableId")    ON DELETE CASCADE,
    "assignedAt"       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("userId","subtableId")
);

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
    "parentCommentId"  UUID REFERENCES "Comment"("commentId") ON DELETE CASCADE,
    "body"             TEXT NOT NULL,
    "createdAt"        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "voteCount"        INT DEFAULT 0 NOT NULL,
    "isRemoved"        BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE "Vote" (
    "voteId"           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "voterUserId"      UUID NOT NULL REFERENCES "RegisteredUser"("userId") ON DELETE CASCADE,
    "postId"           UUID REFERENCES "Post"("postId") ON DELETE CASCADE,
    "commentId"        UUID REFERENCES "Comment"("commentId") ON DELETE CASCADE,
    "voteType"         "VoteType" NOT NULL,
    "createdAt"        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chk_vote_target" CHECK (
        ("postId" IS NOT NULL AND "commentId" IS NULL) OR
        ("postId" IS NULL AND "commentId" IS NOT NULL)
    )
);

CREATE TABLE "Report" (
    "reportId"            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "reporterPrincipalId" UUID NOT NULL REFERENCES "Principal"("principalId") ON DELETE CASCADE,
    "postId"              UUID REFERENCES "Post"("postId")        ON DELETE CASCADE,
    "commentId"           UUID REFERENCES "Comment"("commentId") ON DELETE CASCADE,
    "reason"              TEXT NOT NULL,
    "createdAt"           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isHandled"           BOOLEAN DEFAULT FALSE NOT NULL,
    "handlerPrincipalId"  UUID REFERENCES "Principal"("principalId") ON DELETE SET NULL,
    "handledAt"           TIMESTAMP,
    CONSTRAINT "chk_report_target" CHECK (
        ("postId" IS NOT NULL AND "commentId" IS NULL) OR
        ("postId" IS NULL AND "commentId" IS NOT NULL)
    )
);

CREATE TABLE "SystemRule" (
    "ruleId"             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "title"              VARCHAR(255) NOT NULL,
    "description"        TEXT NOT NULL,
    "createdAt"          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByAdminId" UUID REFERENCES "Admin"("adminId") ON DELETE SET NULL
);

CREATE TABLE "SubtableRule" (
    "ruleId"             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "subtableId"         UUID NOT NULL REFERENCES "Subtable"("subtableId") ON DELETE CASCADE,
    "title"              VARCHAR(255) NOT NULL,
    "description"        TEXT NOT NULL,
    "createdAt"          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorPrincipalId" UUID REFERENCES "Principal"("principalId") ON DELETE SET NULL
);

CREATE TABLE "Notification" (
    "notificationId"        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "recipientUserId"       UUID NOT NULL REFERENCES "RegisteredUser"("userId") ON DELETE CASCADE,
    "triggeringPrincipalId" UUID REFERENCES "Principal"("principalId") ON DELETE SET NULL,
    "type"                  "NotificationType" NOT NULL,
    "sourceUrl"             VARCHAR(2048),
    "content"               TEXT,
    "isRead"                BOOLEAN DEFAULT FALSE NOT NULL,
    "createdAt"             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Message" (
    "messageId"           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "senderUserId"        UUID REFERENCES "RegisteredUser"("userId") ON DELETE SET NULL,
    "recipientUserId"     UUID REFERENCES "RegisteredUser"("userId")    ON DELETE SET NULL,
    "subject"             VARCHAR(255),
    "body"                TEXT NOT NULL,
    "createdAt"           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRead"              BOOLEAN DEFAULT FALSE NOT NULL,
    "senderDeleted"       BOOLEAN DEFAULT FALSE NOT NULL,
    "recipientDeleted"    BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE "Ban" (
    "banId"               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "bannedAccountId"     UUID NOT NULL REFERENCES "Account"("accountId") ON DELETE CASCADE,
    "issuerPrincipalId"   UUID NOT NULL REFERENCES "Principal"("principalId") ON DELETE SET NULL,
    "subtableId"          UUID REFERENCES "Subtable"("subtableId") ON DELETE CASCADE,
    "reason"              TEXT,
    "expiresAt"           TIMESTAMP,
    "createdAt"           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ModeratorLog" (
    "logId"               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "moderatorPrincipalId" UUID NOT NULL REFERENCES "Principal"("principalId") ON DELETE SET NULL,
    "subtableId"          UUID NOT NULL REFERENCES "Subtable"("subtableId") ON DELETE CASCADE,
    "action"              VARCHAR(100) NOT NULL,
    "targetPostId"        UUID REFERENCES "Post"("postId")        ON DELETE SET NULL,
    "targetCommentId"     UUID REFERENCES "Comment"("commentId") ON DELETE SET NULL,
    "targetAccountId"     UUID REFERENCES "Account"("accountId") ON DELETE SET NULL,
    "details"             TEXT,
    "createdAt"           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "AdminLog" (
    "logId"               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "adminId"             UUID NOT NULL REFERENCES "Admin"("adminId") ON DELETE SET NULL,
    "action"              VARCHAR(100) NOT NULL,
    "targetAccountId"     UUID REFERENCES "Account"("accountId") ON DELETE SET NULL,
    "targetSubtableId"    UUID REFERENCES "Subtable"("subtableId") ON DELETE SET NULL,
    "targetPostId"        UUID REFERENCES "Post"("postId")        ON DELETE SET NULL,
    "targetCommentId"     UUID REFERENCES "Comment"("commentId") ON DELETE SET NULL,
    "details"             TEXT,
    "createdAt"           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Media" (
    "mediaId"             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "postId"              UUID NOT NULL REFERENCES "Post"("postId") ON DELETE CASCADE,
    "uploaderPrincipalId" UUID NOT NULL REFERENCES "Principal"("principalId") ON DELETE SET NULL,
    "url"                 VARCHAR(255) UNIQUE NOT NULL,
    "mediaType"           "MediaType" NOT NULL,
    "mimeType"            VARCHAR(50),
    "fileSize"            BIGINT,
    "createdAt"           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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
CREATE INDEX idx_vote_voteruserid ON "Vote"("voterUserId");
CREATE INDEX idx_vote_postid ON "Vote"("postId");
CREATE INDEX idx_vote_commentid ON "Vote"("commentId");
CREATE INDEX idx_vote_votetype ON "Vote"("voteType");
CREATE INDEX idx_report_reporterprincipalid ON "Report"("reporterPrincipalId");
CREATE INDEX idx_report_postid ON "Report"("postId");
CREATE INDEX idx_report_commentid ON "Report"("commentId");
CREATE INDEX idx_report_handlerprincipalid ON "Report"("handlerPrincipalId");
CREATE INDEX idx_systemrule_createdbyadminid ON "SystemRule"("createdByAdminId");
CREATE INDEX idx_subtablerule_subtableid ON "SubtableRule"("subtableId");
CREATE INDEX idx_notification_recipientuserid ON "Notification"("recipientUserId");
CREATE INDEX idx_notification_triggeringprincipalid ON "Notification"("triggeringPrincipalId");
CREATE INDEX idx_message_senderuserid ON "Message"("senderUserId");
CREATE INDEX idx_message_recipientuserid ON "Message"("recipientUserId");
CREATE INDEX idx_ban_bannedaccountid ON "Ban"("bannedAccountId");
CREATE INDEX idx_ban_subtableid ON "Ban"("subtableId");
CREATE INDEX idx_moderatorlog_subtableid ON "ModeratorLog"("subtableId");
CREATE INDEX idx_moderatorlog_moderatorprincipalid ON "ModeratorLog"("moderatorPrincipalId");
CREATE INDEX idx_adminlog_adminid ON "AdminLog"("adminId");
CREATE INDEX idx_media_postid ON "Media"("postId");
CREATE INDEX idx_media_uploaderprincipalid ON "Media"("uploaderPrincipalId");

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
        UPDATE "Post" SET "commentCount" = GREATEST(0,"commentCount" - 1) WHERE "postId" = OLD."postId";
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trigger_update_vote_count()
RETURNS TRIGGER AS $$
DECLARE
    diff INT := 0;
    tgt_post UUID;
    tgt_comment UUID;
BEGIN
    IF TG_OP = 'INSERT' THEN
        tgt_post := NEW."postId";
        tgt_comment := NEW."commentId";
        IF NEW."voteType" = 'upvote' THEN
            diff := 1;
        ELSE
            diff := -1;
        END IF;

    ELSIF TG_OP = 'DELETE' THEN
        tgt_post := OLD."postId";
        tgt_comment := OLD."commentId";
        IF OLD."voteType" = 'upvote' THEN
            diff := -1;
        ELSE
            diff := 1;
        END IF;

    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD."voteType" <> NEW."voteType" THEN
            tgt_post := NEW."postId";
            tgt_comment := NEW."commentId";
             IF NEW."voteType" = 'upvote' THEN
                diff := 2;
             ELSE
                diff := -2;
             END IF;
        ELSE
             RETURN NULL;
        END IF;
    ELSE
         RETURN NULL;
    END IF;

    IF tgt_post IS NOT NULL THEN
        UPDATE "Post" SET "voteCount" = "voteCount" + diff WHERE "postId" = tgt_post;
    ELSIF tgt_comment IS NOT NULL THEN
        UPDATE "Comment" SET "voteCount" = "voteCount" + diff WHERE "commentId" = tgt_comment;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_media_limit()
RETURNS TRIGGER AS $$
DECLARE
    media_limit CONSTANT INTEGER := 3;
    current_count INTEGER;
BEGIN
    SELECT count(*) INTO current_count FROM "Media" WHERE "postId" = NEW."postId";

    IF current_count >= media_limit THEN
        RAISE EXCEPTION 'A post may have at most % media items (postId=%)', media_limit, NEW."postId"
            USING ERRCODE='check_violation', HINT='Remove existing media or upload to a different post.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION enforce_principal_single_role()
RETURNS TRIGGER AS $$
DECLARE
    principal_target_id UUID;
BEGIN
    IF TG_TABLE_NAME = 'RegisteredUser' THEN
        principal_target_id := NEW."principalId";
        IF EXISTS (SELECT 1 FROM "Admin" WHERE "principalId" = principal_target_id) THEN
            RAISE EXCEPTION 'Principal % cannot be added as RegisteredUser because they are already an Admin.', principal_target_id
                USING ERRCODE='integrity_constraint_violation', HINT='A principal must have only one role (User or Admin).';
        END IF;
    ELSIF TG_TABLE_NAME = 'Admin' THEN
        principal_target_id := NEW."principalId";
        IF EXISTS (SELECT 1 FROM "RegisteredUser" WHERE "principalId" = principal_target_id) THEN
            RAISE EXCEPTION 'Principal % cannot be added as Admin because they are already a RegisteredUser.', principal_target_id
                 USING ERRCODE='integrity_constraint_violation', HINT='A principal must have only one role (User or Admin).';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

CREATE OR REPLACE VIEW "UserProfile" AS
SELECT
    ru."userId",
    p."principalId",
    a."username",
    pr."displayName",
    pr."avatar",
    pr."banner",
    ru."karma",
    ru."isVerified",
    ru."status"
FROM "RegisteredUser" ru
JOIN "Principal"       p  ON p."principalId" = ru."principalId"
JOIN "Account"         a  ON a."accountId"   = p."accountId"
JOIN "Profile"         pr ON pr."profileId"  = p."profileId";

CREATE OR REPLACE VIEW "UserCommentDetails" AS
SELECT
    c."commentId",
    c."postId",
    c."parentCommentId",
    c."body",
    c."createdAt" AS "commentCreatedAt",
    c."updatedAt" AS "commentUpdatedAt",
    c."voteCount",
    c."isRemoved",
    up."userId" AS "authorUserId",
    up."principalId" AS "authorPrincipalId",
    up."username" AS "authorUsername",
    up."displayName" AS "authorDisplayName",
    up."avatar" AS "authorAvatar",
    up."karma" AS "authorKarma",
    up."isVerified" AS "authorIsVerified",
    up."status" AS "authorStatus"
FROM "Comment" c
LEFT JOIN "UserProfile" up ON c."authorUserId" = up."userId";

CREATE OR REPLACE VIEW "UserPostDetails" AS
SELECT
    p."postId",
    p."subtableId",
    p."title",
    p."body",
    p."createdAt"        AS "postCreatedAt",
    p."updatedAt"        AS "postUpdatedAt",
    p."voteCount",
    p."commentCount",
    p."isLocked",
    p."isRemoved",
    up."userId"          AS "authorUserId",
    up."principalId"     AS "authorPrincipalId",
    up."username"        AS "authorUsername",
    up."displayName"     AS "authorDisplayName",
    up."avatar"          AS "authorAvatar",
    up."banner"          AS "authorBanner",
    up."karma"           AS "authorKarma",
    up."isVerified"      AS "authorIsVerified",
    up."status"          AS "authorStatus",
    s."name"             AS "subtableName",
    s."description"      AS "subtableDescription",
    s."icon"             AS "subtableIcon",
    s."banner"           AS "subtableBanner",
    s."memberCount"      AS "subtableMemberCount"
FROM "Post" p
LEFT JOIN "UserProfile" up ON p."authorUserId" = up."userId"
LEFT JOIN "Subtable"    s  ON p."subtableId" = s."subtableId";

CREATE OR REPLACE VIEW "UserVoteDetails" AS
SELECT
    v."voteId",
    v."postId",
    v."commentId",
    v."voteType",
    v."createdAt" AS "voteCreatedAt",
    up."userId" AS "voterUserId",
    up."principalId" AS "voterPrincipalId",
    up."username" AS "voterUsername",
    up."displayName" AS "voterDisplayName",
    up."avatar" AS "voterAvatar",
    up."karma" AS "voterKarma",
    up."isVerified" AS "voterIsVerified",
    up."status" AS "voterStatus"
FROM "Vote" v
LEFT JOIN "UserProfile" up ON v."voterUserId" = up."userId";

INSERT INTO "Account" ("accountId","username","password","email") VALUES
  ('00000000-0000-0000-0000-000000000001','user1','hashed_password_1','user1@example.com'),
  ('00000000-0000-0000-0000-000000000002','user2','hashed_password_2','user2@example.com'),
  ('00000000-0000-0000-0000-000000000003','user3','hashed_password_3','user3@example.com'),
  ('00000000-0000-0000-0000-000000000004','user4','hashed_password_4','user4@example.com'),
  ('00000000-0000-0000-0000-000000000005','user5','hashed_password_5','user5@example.com'),
  ('00000000-0000-0000-0000-000000000006','admin1','hashed_password_6','admin1@example.com'),
  ('00000000-0000-0000-0000-000000000007','admin2','hashed_password_7','admin2@example.com'),
  ('00000000-0000-0000-0000-000000000008','admin3','hashed_password_8','admin3@example.com'),
  ('00000000-0000-0000-0000-000000000009','admin4','hashed_password_9','admin4@example.com'),
  ('00000000-0000-0000-0000-000000000010','admin5','hashed_password_10','admin5@example.com')
;

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

INSERT INTO "Principal" ("principalId","accountId","profileId","role") VALUES
  ('00000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000011','user'),
  ('00000000-0000-0000-0000-000000000022','00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000012','user'),
  ('00000000-0000-0000-0000-000000000023','00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000013','user'),
  ('00000000-0000-0000-0000-000000000024','00000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000014','user'),
  ('00000000-0000-0000-0000-000000000025','00000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000015','user'),
  ('00000000-0000-0000-0000-000000000026','00000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000016','admin'),
  ('00000000-0000-0000-0000-000000000027','00000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000017','admin'),
  ('00000000-0000-0000-0000-000000000028','00000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000018','admin'),
  ('00000000-0000-0000-0000-000000000029','00000000-0000-0000-0000-000000000009','00000000-0000-0000-0000-000000000019','admin'),
  ('00000000-0000-0000-0000-000000000030','00000000-0000-0000-0000-000000000010','00000000-0000-0000-0000-000000000020','admin')
;

INSERT INTO "RegisteredUser" ("userId","principalId","karma","isVerified","status","lastActive") VALUES
  ('00000000-0000-0000-0000-000000000031','00000000-0000-0000-0000-000000000021',   10, TRUE,  'active',    '2025-04-24 01:00:00'),
  ('00000000-0000-0000-0000-000000000032','00000000-0000-0000-0000-000000000022',   20, FALSE, 'suspended', '2025-04-23 15:30:00'),
  ('00000000-0000-0000-0000-000000000033','00000000-0000-0000-0000-000000000023',    5, TRUE,  'active',    '2025-04-22 12:00:00'),
  ('00000000-0000-0000-0000-000000000034','00000000-0000-0000-0000-000000000024',    0, FALSE, 'banned',    '2025-04-21 08:45:00'),
  ('00000000-0000-0000-0000-000000000035','00000000-0000-0000-0000-000000000025', 100, TRUE,  'active',    '2025-04-24 01:15:00')
;

INSERT INTO "Admin" ("adminId","principalId","grantedAt") VALUES
  ('00000000-0000-0000-0000-000000000036','00000000-0000-0000-0000-000000000026','2025-04-01 10:00:00'),
  ('00000000-0000-0000-0000-000000000037','00000000-0000-0000-0000-000000000027','2025-03-15 14:20:00'),
  ('00000000-0000-0000-0000-000000000038','00000000-0000-0000-0000-000000000028','2025-02-28 08:00:00'),
  ('00000000-0000-0000-0000-000000000039','00000000-0000-0000-0000-000000000029','2025-04-18 16:45:00'),
  ('00000000-0000-0000-0000-000000000040','00000000-0000-0000-0000-000000000030','2025-04-20 10:30:00')
;

INSERT INTO "Subtable" ("subtableId","name","description","creatorPrincipalId","icon","banner","memberCount") VALUES
  ('00000000-0000-0000-0000-000000000041','AskAnything','A place for any question','00000000-0000-0000-0000-000000000026','https://example.com/icons/ask.png','https://example.com/banners/ask.png',100),
  ('00000000-0000-0000-0000-000000000042','TechTalk','Discussions about technology','00000000-0000-0000-0000-000000000027','https://example.com/icons/tech.png','https://example.com/banners/tech.png',200),
  ('00000000-0000-0000-0000-000000000043','NewsHub','Share and discuss news','00000000-0000-0000-0000-000000000028','https://example.com/icons/news.png','https://example.com/banners/news.png',150),
  ('00000000-0000-0000-0000-000000000044','AnimeClub','For anime fans','00000000-0000-0000-0000-000000000029','https://example.com/icons/anime.png','https://example.com/banners/anime.png',80),
  ('00000000-0000-0000-0000-000000000045','Foodies','Food recipes and reviews','00000000-0000-0000-0000-000000000030','https://example.com/icons/food.png','https://example.com/banners/food.png',120)
;

INSERT INTO "Moderators" ("userId","subtableId") VALUES
  ('00000000-0000-0000-0000-000000000031','00000000-0000-0000-0000-000000000041'),
  ('00000000-0000-0000-0000-000000000032','00000000-0000-0000-0000-000000000042'),
  ('00000000-0000-0000-0000-000000000033','00000000-0000-0000-0000-000000000043'),
  ('00000000-0000-0000-0000-000000000034','00000000-0000-0000-0000-000000000044'),
  ('00000000-0000-0000-0000-000000000035','00000000-0000-0000-0000-000000000045')
;

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
  ('00000000-0000-0000-0000-000000000075','00000000-0000-0000-0000-000000000058','00000000-0000-0000-0000-000000000035','00000000-0000-0000-0000-000000000071','Yep, that anime is awesome.'),
  ('00000000-0000-0000-0000-000000000201','00000000-0000-0000-0000-000000000052','00000000-0000-0000-0000-000000000034','00000000-0000-0000-0000-000000000063','Good point. What about OUTER JOINs then?'),
  ('00000000-0000-0000-0000-000000000202','00000000-0000-0000-0000-000000000053','00000000-0000-0000-0000-000000000031','00000000-0000-0000-0000-000000000065','Totally agree! Scares me a little too, though.'),
  ('00000000-0000-0000-0000-000000000203','00000000-0000-0000-0000-000000000054','00000000-0000-0000-0000-000000000033','00000000-0000-0000-0000-000000000067','Flexibility vs. safety, the eternal debate! I prefer the safety net TS provides for larger projects.'),
  ('00000000-0000-0000-0000-000000000204','00000000-0000-0000-0000-000000000057','00000000-0000-0000-0000-000000000035','00000000-0000-0000-0000-000000000070','Naruto is great! Have you watched Fullmetal Alchemist: Brotherhood?'),
  ('00000000-0000-0000-0000-000000000205','00000000-0000-0000-0000-000000000059','00000000-0000-0000-0000-000000000031','00000000-0000-0000-0000-000000000072','Me too! Especially a good lasagna. Takes time but worth it.')
;

INSERT INTO "Vote" ("voteId","voterUserId","postId","commentId","voteType") VALUES
  ('00000000-0000-0000-0000-000000000076','00000000-0000-0000-0000-000000000031','00000000-0000-0000-0000-000000000051',NULL, 'upvote'),
  ('00000000-0000-0000-0000-000000000077','00000000-0000-0000-0000-000000000032','00000000-0000-0000-0000-000000000051',NULL, 'upvote'),
  ('00000000-0000-0000-0000-000000000078','00000000-0000-0000-0000-000000000033','00000000-0000-0000-0000-000000000052',NULL, 'downvote'),
  ('00000000-0000-0000-0000-000000000079','00000000-0000-0000-0000-000000000034','00000000-0000-0000-0000-000000000053',NULL, 'upvote'),
  ('00000000-0000-0000-0000-000000000080','00000000-0000-0000-0000-000000000035','00000000-0000-0000-0000-000000000054',NULL, 'upvote'),
  ('00000000-0000-0000-0000-000000000085','00000000-0000-0000-0000-000000000031','00000000-0000-0000-0000-000000000055',NULL, 'downvote'),
  ('00000000-0000-0000-0000-000000000086','00000000-0000-0000-0000-000000000032','00000000-0000-0000-0000-000000000056',NULL, 'upvote'),
  ('00000000-0000-0000-0000-000000000087','00000000-0000-0000-0000-000000000033','00000000-0000-0000-0000-000000000057',NULL, 'upvote'),
  ('00000000-0000-0000-0000-000000000088','00000000-0000-0000-0000-000000000034','00000000-0000-0000-0000-000000000058',NULL, 'downvote'),
  ('00000000-0000-0000-0000-000000000089','00000000-0000-0000-0000-000000000035','00000000-0000-0000-0000-000000000059',NULL, 'upvote'),
  ('00000000-0000-0000-0000-000000000095','00000000-0000-0000-0000-000000000031',NULL,'00000000-0000-0000-0000-000000000071','downvote')
;

INSERT INTO "Report" ("reportId","reporterPrincipalId","postId","commentId","reason") VALUES
  ('00000000-0000-0000-0000-000000000096','00000000-0000-0000-0000-000000000023','00000000-0000-0000-0000-000000000053',NULL,'Spam content'),
  ('00000000-0000-0000-0000-000000000097','00000000-0000-0000-0000-000000000024',NULL,'00000000-0000-0000-0000-000000000064','Offensive language'),
  ('00000000-0000-0000-0000-000000000098','00000000-0000-0000-0000-000000000025',NULL,'00000000-0000-0000-0000-000000000074','Harassment')
;

INSERT INTO "SystemRule" ("ruleId","title","description","createdByAdminId") VALUES
  ('00000000-0000-0000-0000-000000000101','Be respectful','Do not harass other users.','00000000-0000-0000-0000-000000000036'),
  ('00000000-0000-0000-0000-000000000102','No spam','Avoid posting spammy content.','00000000-0000-0000-0000-000000000037'),
  ('00000000-0000-0000-0000-000000000103','Use proper channels','Post in the correct community.','00000000-0000-0000-0000-000000000038'),
  ('00000000-0000-0000-0000-000000000104','No impersonation','Do not impersonate others.','00000000-0000-0000-0000-000000000039'),
  ('00000000-0000-0000-0000-000000000105','Follow guidelines','Abide by sitewide policies.','00000000-0000-0000-0000-000000000040')
;

INSERT INTO "SubtableRule" ("ruleId","subtableId","title","description","creatorPrincipalId") VALUES
  ('00000000-0000-0000-0000-000000000106','00000000-0000-0000-0000-000000000041','No self-promo','Do not promote your own products.','00000000-0000-0000-0000-000000000026'),
  ('00000000-0000-0000-0000-000000000107','00000000-0000-0000-0000-000000000042','Tech news only','Only post tech-related news.','00000000-0000-0000-0000-000000000027'),
  ('00000000-0000-0000-0000-000000000108','00000000-0000-0000-0000-000000000043','Verify sources','Provide credible sources for news.','00000000-0000-0000-0000-000000000028'),
  ('00000000-0000-0000-0000-000000000109','00000000-0000-0000-0000-000000000044','Spoiler policy','Use spoiler tags for spoilers.','00000000-0000-0000-0000-000000000029'),
  ('00000000-0000-0000-0000-000000000110','00000000-0000-0000-0000-000000000045','Recipe format','Follow the standard recipe format.','00000000-0000-0000-0000-000000000030')
;

INSERT INTO "Notification" ("notificationId","recipientUserId","triggeringPrincipalId","type","sourceUrl","content") VALUES
  ('00000000-0000-0000-0000-000000000111','00000000-0000-0000-0000-000000000031','00000000-0000-0000-0000-000000000022','comment_reply','/posts/00000000-0000-0000-0000-000000000052#comment-00000000-0000-0000-0000-000000000064','Someone replied to your comment'),
  ('00000000-0000-0000-0000-000000000112','00000000-0000-0000-0000-000000000032','00000000-0000-0000-0000-000000000023','post_reply','/posts/00000000-0000-0000-0000-000000000053#comment-00000000-0000-0000-0000-000000000065','New comment on your post'),
  ('00000000-0000-0000-0000-000000000113','00000000-0000-0000-0000-000000000033','00000000-0000-0000-0000-000000000024','mention','/posts/00000000-0000-0000-0000-000000000054','You were mentioned in a post'),
  ('00000000-0000-0000-0000-000000000114','00000000-0000-0000-0000-000000000034','00000000-0000-0000-0000-000000000025','vote_comment','/posts/00000000-0000-0000-0000-000000000051#comment-00000000-0000-0000-0000-000000000061','Your comment received a new vote'),
  ('00000000-0000-0000-0000-000000000115','00000000-0000-0000-0000-000000000035','00000000-0000-0000-0000-000000000026','moderator_invite','/subtables/00000000-0000-0000-0000-000000000041','You have been invited as a moderator')
;

INSERT INTO "Message" ("messageId","senderUserId","recipientUserId","subject","body") VALUES
  ('00000000-0000-0000-0000-000000000116','00000000-0000-0000-0000-000000000031','00000000-0000-0000-0000-000000000032','Hello','Hi User 2, I have a question.'),
  ('00000000-0000-0000-0000-000000000117','00000000-0000-0000-0000-000000000032','00000000-0000-0000-0000-000000000031','Re: Hello','Sure, how can I help?'),
  ('00000000-0000-0000-0000-000000000118','00000000-0000-0000-0000-000000000033','00000000-0000-0000-0000-000000000034','Issue','I found a bug in the forum.'),
  ('00000000-0000-0000-0000-000000000119',NULL,'00000000-0000-0000-0000-000000000031','Re: Issue','Thanks for reporting, we’ll look into it.'),
  ('00000000-0000-0000-0000-000000000120','00000000-0000-0000-0000-000000000034','00000000-0000-0000-0000-000000000035','Question','Can I post images?'),
  ('00000000-0000-0000-0000-000000000121',NULL,'00000000-0000-0000-0000-000000000032','Re: Question','Yes, you can upload media.'),
  ('00000000-0000-0000-0000-000000000122','00000000-0000-0000-0000-000000000035','00000000-0000-0000-0000-000000000033','Greetings','Welcome to the community!'),
  ('00000000-0000-0000-0000-000000000123',NULL,'00000000-0000-0000-0000-000000000034','Re: Greetings','Thank you! Happy to be here.'),
  ('00000000-0000-0000-0000-000000000124',NULL,'00000000-0000-0000-0000-000000000035','Reminder','Don’t forget the meeting tomorrow.'),
  ('00000000-0000-0000-0000-000000000125',NULL,'00000000-0000-0000-0000-000000000031','Re: Reminder','Got it, thanks.'),
  ('00000000-0000-0000-0000-000000000126','00000000-0000-0000-0000-000000000031','00000000-0000-0000-0000-000000000032','Question','How do I change my password?'),
  ('00000000-0000-0000-0000-000000000127','00000000-0000-0000-0000-000000000032','00000000-0000-0000-0000-000000000031','Re: Question','Go to account settings.'),
  ('00000000-0000-0000-0000-000000000128','00000000-0000-0000-0000-000000000033','00000000-0000-0000-0000-000000000034','Feedback','Love the new UI!'),
  ('00000000-0000-0000-0000-000000000129','00000000-0000-0000-0000-000000000034','00000000-0000-0000-0000-000000000031','Re: Feedback','Glad you like it.'),
  ('00000000-0000-0000-0000-000000000130','00000000-0000-0000-0000-000000000034','00000000-0000-0000-0000-000000000035','Hello','Hi there!'),
  ('00000000-0000-0000-0000-000000000131','00000000-0000-0000-0000-000000000035','00000000-0000-0000-0000-000000000031','Re: Hello','Hello back!'),
  ('00000000-0000-0000-0000-000000000132','00000000-0000-0000-0000-000000000031','00000000-0000-0000-0000-000000000032','Alert','Your account has new privileges.'),
  ('00000000-0000-0000-0000-000000000133','00000000-0000-0000-0000-000000000032','00000000-0000-0000-0000-000000000033','Re: Alert','Thanks for the update.'),
  ('00000000-0000-0000-0000-000000000134','00000000-0000-0000-0000-000000000033','00000000-0000-0000-0000-000000000035','Question','Where can I find docs?'),
  ('00000000-0000-0000-0000-000000000135','00000000-0000-0000-0000-000000000034','00000000-0000-0000-0000-000000000034','Re: Question','See the help center.')
;

INSERT INTO "Ban" ("banId","bannedAccountId","issuerPrincipalId","subtableId","reason","expiresAt") VALUES
  ('00000000-0000-0000-0000-000000000136','00000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000029',NULL,'Violation of terms','2025-05-01 00:00:00'),
  ('00000000-0000-0000-0000-000000000137','00000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000030','00000000-0000-0000-0000-000000000044','Spamming','2025-04-25 12:00:00'),
  ('00000000-0000-0000-0000-000000000138','00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000026',NULL,'Harassment',NULL),
  ('00000000-0000-0000-0000-000000000139','00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000027','00000000-0000-0000-0000-000000000042','Off-topic posts','2025-04-30 08:00:00'),
  ('00000000-0000-0000-0000-000000000140','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000028',NULL,'Multiple accounts',NULL)
;

INSERT INTO "ModeratorLog" ("logId","moderatorPrincipalId","subtableId","action","targetPostId","targetCommentId","targetAccountId","details") VALUES
  ('00000000-0000-0000-0000-000000000141','00000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000041','remove_post','00000000-0000-0000-0000-000000000052',NULL,NULL,'Inappropriate content'),
  ('00000000-0000-0000-0000-000000000142','00000000-0000-0000-0000-000000000022','00000000-0000-0000-0000-000000000042','ban_user',NULL,NULL,'00000000-0000-0000-0000-000000000004','Repeated spam'),
  ('00000000-0000-0000-0000-000000000143','00000000-0000-0000-0000-000000000023','00000000-0000-0000-0000-000000000043','approve_comment',NULL,'00000000-0000-0000-0000-000000000064',NULL,'Looks good'),
  ('00000000-0000-0000-0000-000000000144','00000000-0000-0000-0000-000000000024','00000000-0000-0000-0000-000000000044','unban_user',NULL,NULL,'00000000-0000-0000-0000-000000000004','Time served'),
  ('00000000-0000-0000-0000-000000000145','00000000-0000-0000-0000-000000000025','00000000-0000-0000-0000-000000000045','lock_post','00000000-0000-0000-0000-000000000060',NULL,NULL,'Closed discussion')
;

INSERT INTO "AdminLog" ("logId","adminId","action","targetAccountId","targetSubtableId","targetPostId","targetCommentId","details") VALUES
  ('00000000-0000-0000-0000-000000000146','00000000-0000-0000-0000-000000000036','suspend_account','00000000-0000-0000-0000-000000000005',NULL,NULL,NULL,'Policy violation'),
  ('00000000-0000-0000-0000-000000000147','00000000-0000-0000-0000-000000000037','delete_subtable',NULL,'00000000-0000-0000-0000-000000000045',NULL,NULL,'Obsolete community'),
  ('00000000-0000-0000-0000-000000000148','00000000-0000-0000-0000-000000000038','grant_admin','00000000-0000-0000-0000-000000000010',NULL,NULL,NULL,'Promoted user to admin'),
  ('00000000-0000-0000-0000-000000000149','00000000-0000-0000-0000-000000000039','modify_subtable',NULL,'00000000-0000-0000-0000-000000000042',NULL,NULL,'Updated description'),
  ('00000000-0000-0000-0000-000000000150','00000000-0000-0000-0000-000000000040','delete_post',NULL,NULL,'00000000-0000-0000-0000-000000000055',NULL,'User request')
;

INSERT INTO "Media" ("mediaId","postId","uploaderPrincipalId","url","mediaType","mimeType","fileSize") VALUES
  ('00000000-0000-0000-0000-000000000151','00000000-0000-0000-0000-000000000051','00000000-0000-0000-0000-000000000021','https://cdn.example.com/media/1.jpg','image','image/jpeg',204800),
  ('00000000-0000-0000-0000-000000000152','00000000-0000-0000-0000-000000000052','00000000-0000-0000-0000-000000000022','https://cdn.example.com/media/2.png','image','image/png',102400),
  ('00000000-0000-0000-0000-000000000153','00000000-0000-0000-0000-000000000053','00000000-0000-0000-0000-000000000023','https://cdn.example.com/media/3.mp4','video','video/mp4',10485760),
  ('00000000-0000-0000-0000-000000000154','00000000-0000-0000-0000-000000000054','00000000-0000-0000-0000-000000000024','https://cdn.example.com/media/4.mov','video','video/quicktime',20971520),
  ('00000000-0000-0000-0000-000000000155','00000000-0000-0000-0000-000000000055','00000000-0000-0000-0000-000000000025','https://cdn.example.com/media/5.gif','image','image/gif',51200)
;