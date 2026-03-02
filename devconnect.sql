CREATE DATABASE  IF NOT EXISTS `devconnect` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `devconnect`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: devconnect
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('12f292f5-9c29-42f4-bde2-a7d5dda680de','bca5aea7bd7f282e6b0b0473d54c483963c4c219cc72e38d0b245e5fa03b3402','2026-03-02 11:36:06.761','20260218155234_add_code_to_project',NULL,NULL,'2026-03-02 11:36:06.628',1),('35641834-e84a-4c9a-9aa6-58324f6f590c','86e432466dcc4cff1221ec51dcec510e3b1dd3d015f67bd3671754b4a1c95da5','2026-03-02 11:36:06.600','20260212060029_add_friendships',NULL,NULL,'2026-03-02 11:36:05.047',1),('39fcb91d-14f1-4b25-9d1b-2054c4b33152','7dcd60d37623550e87fdb9fe7c7be59a8c0bc1094f955c2ea3ff36974afee1a6','2026-03-02 11:36:05.035','20260205083428_adicionando_mensagens',NULL,NULL,'2026-03-02 11:35:55.074',1),('971cec04-9e7e-4633-8a0e-c847e018c710','7b48234d8eaeda2f7db0d6a53a457f83e6ff4aa3e19ff1d63c5dcc49ecbabcb0','2026-03-02 11:35:55.062','20260203084916_add_bookmarks_settings_and_project_fields',NULL,NULL,'2026-03-02 11:35:51.580',1),('e9a85b7a-58f5-472b-b47f-639a58d5e1fd','43bca6d01a4ea2a881400ac6dc08f3ec51051de033e6d4f4b334031a670536a5','2026-03-02 11:35:51.550','20260128074428_init',NULL,NULL,'2026-03-02 11:35:39.896',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `applications`
--

DROP TABLE IF EXISTS `applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `applications` (
  `id` varchar(191) NOT NULL,
  `jobId` varchar(191) NOT NULL,
  `developerId` varchar(191) NOT NULL,
  `status` enum('PENDING','REVIEWING','INTERVIEW','ACCEPTED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `aiScore` int(11) DEFAULT NULL,
  `aiReasoning` text DEFAULT NULL,
  `coverLetter` text DEFAULT NULL,
  `resumeUrl` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `applications_jobId_developerId_key` (`jobId`,`developerId`),
  KEY `applications_jobId_idx` (`jobId`),
  KEY `applications_developerId_idx` (`developerId`),
  KEY `applications_status_idx` (`status`),
  CONSTRAINT `applications_developerId_fkey` FOREIGN KEY (`developerId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `applications_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `jobs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `applications`
--

LOCK TABLES `applications` WRITE;
/*!40000 ALTER TABLE `applications` DISABLE KEYS */;
/*!40000 ALTER TABLE `applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookmarks`
--

DROP TABLE IF EXISTS `bookmarks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookmarks` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `projectId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `bookmarks_userId_projectId_key` (`userId`,`projectId`),
  KEY `bookmarks_userId_idx` (`userId`),
  KEY `bookmarks_projectId_idx` (`projectId`),
  CONSTRAINT `bookmarks_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `bookmarks_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookmarks`
--

LOCK TABLES `bookmarks` WRITE;
/*!40000 ALTER TABLE `bookmarks` DISABLE KEYS */;
/*!40000 ALTER TABLE `bookmarks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` varchar(191) NOT NULL,
  `projectId` varchar(191) NOT NULL,
  `authorId` varchar(191) NOT NULL,
  `content` text NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `comments_projectId_idx` (`projectId`),
  KEY `comments_authorId_idx` (`authorId`),
  CONSTRAINT `comments_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `comments_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `id` varchar(191) NOT NULL,
  `user1Id` varchar(191) NOT NULL,
  `user2Id` varchar(191) NOT NULL,
  `lastMessageAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `theme` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`theme`)),
  PRIMARY KEY (`id`),
  UNIQUE KEY `conversations_user1Id_user2Id_key` (`user1Id`,`user2Id`),
  KEY `conversations_user1Id_idx` (`user1Id`),
  KEY `conversations_user2Id_idx` (`user2Id`),
  KEY `conversations_lastMessageAt_idx` (`lastMessageAt`),
  CONSTRAINT `conversations_user1Id_fkey` FOREIGN KEY (`user1Id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `conversations_user2Id_fkey` FOREIGN KEY (`user2Id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dev_events`
--

DROP TABLE IF EXISTS `dev_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dev_events` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `organizer` varchar(191) NOT NULL,
  `date` datetime(3) NOT NULL,
  `type` enum('Hackathon','Meetup','Webinar') NOT NULL,
  `image` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `isOnline` tinyint(1) NOT NULL DEFAULT 0,
  `location` varchar(191) DEFAULT NULL,
  `attendees` int(11) NOT NULL DEFAULT 0,
  `maxAttendees` int(11) DEFAULT NULL,
  `registrationUrl` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `creatorId` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `dev_events_date_idx` (`date`),
  KEY `dev_events_type_idx` (`type`),
  KEY `dev_events_creatorId_fkey` (`creatorId`),
  CONSTRAINT `dev_events_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dev_events`
--

LOCK TABLES `dev_events` WRITE;
/*!40000 ALTER TABLE `dev_events` DISABLE KEYS */;
/*!40000 ALTER TABLE `dev_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `direct_messages`
--

DROP TABLE IF EXISTS `direct_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `direct_messages` (
  `id` varchar(191) NOT NULL,
  `conversationId` varchar(191) NOT NULL,
  `senderId` varchar(191) NOT NULL,
  `content` text NOT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `readAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `audioDuration` int(11) DEFAULT NULL,
  `audioUrl` varchar(191) DEFAULT NULL,
  `fileName` varchar(191) DEFAULT NULL,
  `fileUrl` varchar(191) DEFAULT NULL,
  `isEdited` tinyint(1) NOT NULL DEFAULT 0,
  `isForwarded` tinyint(1) NOT NULL DEFAULT 0,
  `isPinned` tinyint(1) NOT NULL DEFAULT 0,
  `type` enum('TEXT','IMAGE','FILE','AUDIO') NOT NULL DEFAULT 'TEXT',
  PRIMARY KEY (`id`),
  KEY `direct_messages_conversationId_idx` (`conversationId`),
  KEY `direct_messages_senderId_idx` (`senderId`),
  KEY `direct_messages_createdAt_idx` (`createdAt`),
  CONSTRAINT `direct_messages_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `conversations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `direct_messages_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `direct_messages`
--

LOCK TABLES `direct_messages` WRITE;
/*!40000 ALTER TABLE `direct_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `direct_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_attendees`
--

DROP TABLE IF EXISTS `event_attendees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_attendees` (
  `id` varchar(191) NOT NULL,
  `eventId` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `event_attendees_eventId_userId_key` (`eventId`,`userId`),
  KEY `event_attendees_eventId_idx` (`eventId`),
  KEY `event_attendees_userId_idx` (`userId`),
  CONSTRAINT `event_attendees_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `dev_events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `event_attendees_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_attendees`
--

LOCK TABLES `event_attendees` WRITE;
/*!40000 ALTER TABLE `event_attendees` DISABLE KEYS */;
/*!40000 ALTER TABLE `event_attendees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `friendships`
--

DROP TABLE IF EXISTS `friendships`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `friendships` (
  `id` varchar(191) NOT NULL,
  `senderId` varchar(191) NOT NULL,
  `receiverId` varchar(191) NOT NULL,
  `status` enum('pending','accepted','blocked') NOT NULL DEFAULT 'pending',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `friendships_senderId_receiverId_key` (`senderId`,`receiverId`),
  KEY `friendships_senderId_idx` (`senderId`),
  KEY `friendships_receiverId_idx` (`receiverId`),
  KEY `friendships_status_idx` (`status`),
  CONSTRAINT `friendships_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `friendships_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `friendships`
--

LOCK TABLES `friendships` WRITE;
/*!40000 ALTER TABLE `friendships` DISABLE KEYS */;
/*!40000 ALTER TABLE `friendships` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hub_members`
--

DROP TABLE IF EXISTS `hub_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hub_members` (
  `id` varchar(191) NOT NULL,
  `hubId` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `muteNotifications` tinyint(1) NOT NULL DEFAULT 0,
  `joinedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `hub_members_hubId_userId_key` (`hubId`,`userId`),
  KEY `hub_members_hubId_idx` (`hubId`),
  KEY `hub_members_userId_idx` (`userId`),
  CONSTRAINT `hub_members_hubId_fkey` FOREIGN KEY (`hubId`) REFERENCES `hubs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `hub_members_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hub_members`
--

LOCK TABLES `hub_members` WRITE;
/*!40000 ALTER TABLE `hub_members` DISABLE KEYS */;
/*!40000 ALTER TABLE `hub_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hub_messages`
--

DROP TABLE IF EXISTS `hub_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hub_messages` (
  `id` varchar(191) NOT NULL,
  `hubId` varchar(191) NOT NULL,
  `authorId` varchar(191) NOT NULL,
  `content` text NOT NULL,
  `likes` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `audioDuration` int(11) DEFAULT NULL,
  `audioUrl` varchar(191) DEFAULT NULL,
  `fileName` varchar(191) DEFAULT NULL,
  `fileUrl` varchar(191) DEFAULT NULL,
  `isEdited` tinyint(1) NOT NULL DEFAULT 0,
  `isForwarded` tinyint(1) NOT NULL DEFAULT 0,
  `isPinned` tinyint(1) NOT NULL DEFAULT 0,
  `type` enum('TEXT','IMAGE','FILE','AUDIO') NOT NULL DEFAULT 'TEXT',
  PRIMARY KEY (`id`),
  KEY `hub_messages_hubId_idx` (`hubId`),
  KEY `hub_messages_authorId_idx` (`authorId`),
  KEY `hub_messages_createdAt_idx` (`createdAt`),
  CONSTRAINT `hub_messages_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `hub_messages_hubId_fkey` FOREIGN KEY (`hubId`) REFERENCES `hubs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hub_messages`
--

LOCK TABLES `hub_messages` WRITE;
/*!40000 ALTER TABLE `hub_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `hub_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hubs`
--

DROP TABLE IF EXISTS `hubs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hubs` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(191) DEFAULT NULL,
  `color` varchar(191) DEFAULT NULL,
  `createdById` varchar(191) NOT NULL,
  `membersCount` int(11) NOT NULL DEFAULT 0,
  `messagesCount` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `coverImage` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hubs_name_key` (`name`),
  KEY `hubs_name_idx` (`name`),
  KEY `hubs_createdAt_idx` (`createdAt`),
  KEY `hubs_createdById_fkey` (`createdById`),
  CONSTRAINT `hubs_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hubs`
--

LOCK TABLES `hubs` WRITE;
/*!40000 ALTER TABLE `hubs` DISABLE KEYS */;
/*!40000 ALTER TABLE `hubs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` varchar(191) NOT NULL,
  `companyId` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `location` varchar(191) NOT NULL,
  `type` enum('FullTime','Internship','Contract') NOT NULL DEFAULT 'FullTime',
  `salary` varchar(191) DEFAULT NULL,
  `description` text NOT NULL,
  `requirements` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`requirements`)),
  `views` int(11) NOT NULL DEFAULT 0,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `vacancies` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `jobs_companyId_idx` (`companyId`),
  KEY `jobs_type_idx` (`type`),
  KEY `jobs_createdAt_idx` (`createdAt`),
  KEY `jobs_isActive_idx` (`isActive`),
  CONSTRAINT `jobs_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `type` enum('FRIEND_REQUEST','FRIEND_ACCEPTED','JOB_APPLICATION','APPLICATION_STATUS_CHANGE','NEW_MESSAGE','EVENT_REMINDER','SYSTEM') NOT NULL,
  `title` varchar(191) NOT NULL,
  `content` text NOT NULL,
  `link` varchar(191) DEFAULT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_userId_idx` (`userId`),
  KEY `notifications_createdAt_idx` (`createdAt`),
  CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otps`
--

DROP TABLE IF EXISTS `otps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otps` (
  `id` varchar(191) NOT NULL,
  `identifier` varchar(191) NOT NULL,
  `code` varchar(191) NOT NULL,
  `type` enum('REGISTRATION','PASSWORD_RESET') NOT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `otps_identifier_idx` (`identifier`),
  KEY `otps_code_idx` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otps`
--

LOCK TABLES `otps` WRITE;
/*!40000 ALTER TABLE `otps` DISABLE KEYS */;
/*!40000 ALTER TABLE `otps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `id` varchar(191) NOT NULL,
  `authorId` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` text NOT NULL,
  `image` varchar(191) DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`tags`)),
  `likes` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `githubUrl` varchar(191) DEFAULT NULL,
  `views` int(11) NOT NULL DEFAULT 0,
  `code` text DEFAULT NULL,
  `language` enum('html','javascript','react') DEFAULT 'html',
  PRIMARY KEY (`id`),
  KEY `projects_authorId_idx` (`authorId`),
  KEY `projects_createdAt_idx` (`createdAt`),
  CONSTRAINT `projects_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `startup_projects`
--

DROP TABLE IF EXISTS `startup_projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `startup_projects` (
  `id` varchar(191) NOT NULL,
  `ownerId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `tagline` varchar(191) NOT NULL,
  `description` text NOT NULL,
  `logo` varchar(191) NOT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`tags`)),
  `status` enum('MVP','Beta','Scaling') NOT NULL DEFAULT 'MVP',
  `upvotes` int(11) NOT NULL DEFAULT 0,
  `websiteUrl` varchar(191) DEFAULT NULL,
  `githubUrl` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `code` text DEFAULT NULL,
  `language` enum('html','javascript','react') DEFAULT 'html',
  PRIMARY KEY (`id`),
  KEY `startup_projects_ownerId_idx` (`ownerId`),
  KEY `startup_projects_status_idx` (`status`),
  CONSTRAINT `startup_projects_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `startup_projects`
--

LOCK TABLES `startup_projects` WRITE;
/*!40000 ALTER TABLE `startup_projects` DISABLE KEYS */;
/*!40000 ALTER TABLE `startup_projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_settings`
--

DROP TABLE IF EXISTS `user_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_settings` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `emailNotifications` tinyint(1) NOT NULL DEFAULT 1,
  `pushNotifications` tinyint(1) NOT NULL DEFAULT 0,
  `jobAlerts` tinyint(1) NOT NULL DEFAULT 1,
  `messageAlerts` tinyint(1) NOT NULL DEFAULT 1,
  `weeklyDigest` tinyint(1) NOT NULL DEFAULT 0,
  `profileVisibility` enum('public','connections','private') NOT NULL DEFAULT 'public',
  `showEmail` tinyint(1) NOT NULL DEFAULT 0,
  `showActivity` tinyint(1) NOT NULL DEFAULT 1,
  `allowMessages` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_settings_userId_key` (`userId`),
  KEY `user_settings_userId_idx` (`userId`),
  CONSTRAINT `user_settings_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_settings`
--

LOCK TABLES `user_settings` WRITE;
/*!40000 ALTER TABLE `user_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(191) NOT NULL,
  `type` enum('developer','company') NOT NULL DEFAULT 'developer',
  `name` varchar(191) NOT NULL,
  `username` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `bio` text DEFAULT NULL,
  `avatar` longtext DEFAULT NULL,
  `role` varchar(191) DEFAULT NULL,
  `githubUsername` varchar(191) DEFAULT NULL,
  `skills` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`skills`)),
  `website` varchar(191) DEFAULT NULL,
  `companyDescription` text DEFAULT NULL,
  `industry` varchar(191) DEFAULT NULL,
  `logo` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `isVerified` tinyint(1) NOT NULL DEFAULT 0,
  `phone` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_username_key` (`username`),
  UNIQUE KEY `users_email_key` (`email`),
  UNIQUE KEY `users_phone_key` (`phone`),
  KEY `users_username_idx` (`username`),
  KEY `users_email_idx` (`email`),
  KEY `users_type_idx` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('cmm93yucr0001escwpajqubup','developer','João Silva','silva','gabriel@example.com','$2b$10$MAC7Lm1WIefX4tYlp9kDyu4msMW0CDrcIhKhGUShHbKLqmD/6EVaC','Developer no DevConnect','https://api.dicebear.com/7.x/avataaars/svg?seed=silva',NULL,NULL,'\"[\\\"React\\\"]\"',NULL,NULL,NULL,NULL,'2026-03-02 11:41:21.573','2026-03-02 11:41:21.573',1,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-02 15:15:14
