-- --------------------------------------------------------
-- Hôte:                         127.0.0.1
-- Version du serveur:           10.6.8-MariaDB - mariadb.org binary distribution
-- SE du serveur:                Win64
-- HeidiSQL Version:             11.3.0.6295
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Listage de la structure de la table gwe. addon
DROP TABLE IF EXISTS `addon`;
CREATE TABLE IF NOT EXISTS `addon` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `version` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `link` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tags` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gwe.addon : ~2 rows (environ)
/*!40000 ALTER TABLE `addon` DISABLE KEYS */;
INSERT INTO `addon` (`id`, `name`, `version`, `link`, `tags`, `description`) VALUES
	(1, 'addon-ecs', '1.0.0', 'https://github.com/ra1jin/gwe-addon-ecs', ' ', 'Ajoute une implémentation de l\'architecture entité composant système.'),
	(2, 'addon-scene', '1.0.0', 'https://github.com/ra1jin/gwe-addon-scene', ' ', 'Ajoute une implémentation de l\'architecture en graph de scène.'),
	(3, 'addon-mvc', '1.0.0', 'https://github.com/ra1jin/gwe-addon-mvc', ' ', 'Ajoute une implémentation de l\'architecture modèle vue controlleur.');
/*!40000 ALTER TABLE `addon` ENABLE KEYS */;

-- Listage de la structure de la table gwe. doctrine_migration_versions
DROP TABLE IF EXISTS `doctrine_migration_versions`;
CREATE TABLE IF NOT EXISTS `doctrine_migration_versions` (
  `version` varchar(191) COLLATE utf8mb3_unicode_ci NOT NULL,
  `executed_at` datetime DEFAULT NULL,
  `execution_time` int(11) DEFAULT NULL,
  PRIMARY KEY (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

-- Listage des données de la table gwe.doctrine_migration_versions : ~5 rows (environ)
/*!40000 ALTER TABLE `doctrine_migration_versions` DISABLE KEYS */;
INSERT INTO `doctrine_migration_versions` (`version`, `executed_at`, `execution_time`) VALUES
	('DoctrineMigrations\\Version20220526174946', '2022-05-26 17:50:04', 52),
	('DoctrineMigrations\\Version20220526175405', '2022-05-26 17:54:09', 34),
	('DoctrineMigrations\\Version20220526181604', '2022-05-26 18:16:07', 32),
	('DoctrineMigrations\\Version20220526232004', '2022-05-26 23:20:07', 95),
	('DoctrineMigrations\\Version20220527102717', '2022-05-27 10:27:22', 33);
/*!40000 ALTER TABLE `doctrine_migration_versions` ENABLE KEYS */;

-- Listage de la structure de la table gwe. messenger_messages
DROP TABLE IF EXISTS `messenger_messages`;
CREATE TABLE IF NOT EXISTS `messenger_messages` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `body` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `headers` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue_name` varchar(190) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `available_at` datetime NOT NULL,
  `delivered_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_75EA56E0FB7336F0` (`queue_name`),
  KEY `IDX_75EA56E0E3BD61CE` (`available_at`),
  KEY `IDX_75EA56E016BA31DB` (`delivered_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gwe.messenger_messages : ~0 rows (environ)
/*!40000 ALTER TABLE `messenger_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `messenger_messages` ENABLE KEYS */;

-- Listage de la structure de la table gwe. project
DROP TABLE IF EXISTS `project`;
CREATE TABLE IF NOT EXISTS `project` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `banner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `banner_alt` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `version` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `difficulty` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `projection` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `graphics` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `genre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `author` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tags` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `closeups` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `md` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `disabled` tinyint(1) NOT NULL,
  `thumbnail` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gwe.project : ~6 rows (environ)
/*!40000 ALTER TABLE `project` DISABLE KEYS */;
INSERT INTO `project` (`id`, `name`, `banner`, `banner_alt`, `price`, `status`, `version`, `difficulty`, `projection`, `graphics`, `genre`, `author`, `tags`, `closeups`, `md`, `disabled`, `thumbnail`, `description`, `type`) VALUES
	(1, 'Edgar', '/images/banner-template-edgar.jpg', 'Edgar banner', '60.00', 'Disponible', '1.0.0', '1/10', '2D', 'Digital-art', 'Visual Novel', 'Raijin', '2d, manga, visual novel, digital-art', '', 'Edgar est un starter-kit de visual novel.\r\nCréez vos propres scripts afin de développer votre histoire.\r\nEt si cela ne suffit pas, vous pouvez facilement personnaliser le code selon vos besoins grâce à une base de code propre et bien structurée.   	   \r\n   \r\n**Fonctionnalités:**\r\n- Commandes de scripts:\r\n	- Attend un évènement clavier pour continuer\r\n	- Effectue un saut de script\r\n	- Effectue un saut de script seulement si la condition est validée\r\n	- Execute la commande seulement si la condition est validée\r\n	- Définit une valeur à une variable\r\n	- Ajoute une valeur à une variable\r\n	- Retranche une valeur à une variable\r\n	- Attend pendant x ms\r\n	- Affiche un dialogue\r\n	- Affiche un dialogue avec choix multiples\r\n	- Affiche un dialogue avec une image\r\n	- Affiche un texte en plein écran\r\n	- Affiche un personnage\r\n	- Affiche une image de fond\r\n	- Joue une animation sur le sprite d\'un personnage\r\n	- Joue une animation sur le sprite d\'une image de fond\r\n	- Anime l\'élement graphique du personnage (translation, rotation, etc...)\r\n	- Anime l\'élément graphique de l\'image de fond (translation, rotation, etc...)\r\n	- Suppression d\'un personnage\r\n	- Suppression d\'une image de fond\r\n	- Effectue un effet de fondu entrant\r\n	- Effectue un effet de fondu sortant\r\n   \r\n**Actifs artistiques:**\r\n- Image de fond\r\n- Personnages animés   \r\n   \r\n**Licence:**   \r\nVous êtes autorisés à utiliser ce modèle de projet dans votre jeu commercial.\r\nVous n\'êtes pas autorisé à distribuer ou à revendre le code source, les actifs et les fichiers contenus dans ce package.\r\nVous êtes autorisé à distribuer ou à vendre l\'exécutable compilé créé à l\'aide de ceci.', 1, '/images/card-template-edgar.jpg', 'La meilleur façon de démarrer un roman visuel', 'Projet de démarrage'),
	(2, 'Jessie', '/images/banner-template-jessie.jpg', 'Jessie banner', '60.00', 'Non disponible', '1.0.0', '5/10', '2D Isometric', 'Pixel-art', 'Orienté RPG', 'Raijin', '2d, isometric, rpg, pixel-art', '', 'Jessie est un starter-kit de navigation en vue isométrique, il est fortement recommandé de l\'utiliser conjointement avec le template\r\nOdin pour avoir un ensemble complet de jeu de role.\r\nCréez vos propres scènes, ajoutez des scripts, des objets, des déclencheurs et des personnages afin de développer votre histoire.\r\nEt si cela ne suffit pas, vous pouvez facilement personnaliser le code selon vos besoins grâce à une base de code propre et bien structurée.   	   \r\n   \r\n**Fonctionnalités:**\r\n- Joueur\r\n	- Système de variables utilisables dans les scripts (utile pour avancer dans l\'histoire)\r\n- Contrôle du joueur\r\n- Modèle animé avec déclenchement d\'évènements\r\n- Modèle invisible avec déclenchement d\'évènements\r\n- Ligne invisible permettant le mouvement des modèles\r\n- Points d\'apparitions\r\n- Commandes de scripts:\r\n	- Le joueur est bloqué\r\n	- La joueur est libre\r\n	- Attend un évènement clavier pour continuer\r\n	- Effectue un saut de script\r\n	- Effectue un saut de script seulement si la condition est validée\r\n	- Execute la commande seulement si la condition est validée\r\n	- Définit une valeur à une variable\r\n	- Ajoute une valeur à une variable\r\n	- Retranche une valeur à une variable\r\n	- Attend pendant x ms\r\n	- Affiche un dialogue\r\n	- Affiche un dialogue avec choix multiples\r\n	- Effectue un effet de fondu entrant\r\n	- Effectue un effet de fondu sortant\r\n	- Le modèle parcours la ligne invisible\r\n	- Le modèle joue une animation   \r\n   \r\n**Actifs artistiques:**\r\n- Image de fond (ref: FFT) (livré avec le fichier Blender)\r\n- Personnages animés (ref: FFT)   \r\n   \r\n**Licence:**   \r\nVous êtes autorisés à utiliser ce modèle de projet dans votre jeu commercial.\r\nVous n\'êtes pas autorisé à distribuer ou à revendre le code source, les actifs et les fichiers contenus dans ce package.\r\nVous êtes autorisé à distribuer ou à vendre l\'exécutable compilé créé à l\'aide de ceux-ci.', 1, '/images/card-template-jessie.jpg', 'La meilleur façon de démarrer une scène en deux dimensions isométrique', 'Projet de démarrage'),
	(3, 'Luna', '/images/banner-template-luna.jpg', 'Luna banner', '60.00', 'Non disponible', '1.0.0', '2/10', '2D Top-down', 'Pixel-art', 'Orienté RPG', 'Raijin', '2d, top-down, rpg, pixel-art', '', 'Luna est un starter-kit de navigation en deux dimensions vue de haut, il est fortement recommandé de l\'utiliser conjointement avec le template\r\nOdin pour avoir un ensemble complet de jeu de role.\r\nCréez vos propres scènes, ajoutez des scripts, des objets, des déclencheurs et des personnages afin de développer votre histoire.\r\nEt si cela ne suffit pas, vous pouvez facilement personnaliser le code selon vos besoins grâce à une base de code propre et bien structurée.   	   \r\n   \r\n**Fonctionnalités:**\r\n- Joueur\r\n	- Système de variables utilisables dans les scripts (utile pour avancer dans l\'histoire)\r\n- Contrôle du joueur\r\n- Modèle animé avec déclenchement d\'évènements\r\n- Modèle invisible avec déclenchement d\'évènements\r\n- Ligne invisible permettant le mouvement des modèles\r\n- Points d\'apparitions\r\n- Commandes de scripts:\r\n	- Le joueur est bloqué\r\n	- La joueur est libre\r\n	- Attend un évènement clavier pour continuer\r\n	- Effectue un saut de script\r\n	- Effectue un saut de script seulement si la condition est validée\r\n	- Execute la commande seulement si la condition est validée\r\n	- Définit une valeur à une variable\r\n	- Ajoute une valeur à une variable\r\n	- Retranche une valeur à une variable\r\n	- Attend pendant x ms\r\n	- Affiche un dialogue\r\n	- Affiche un dialogue avec choix multiples\r\n	- Effectue un effet de fondu entrant\r\n	- Effectue un effet de fondu sortant\r\n	- Le modèle parcourt la ligne invisible\r\n	- Le modèle joue une animation   \r\n   \r\n**Actifs artistiques:**\r\n- Image de fond (livré avec le fichier Blender)\r\n- Personnages animés   \r\n   \r\n**Licence:**   \r\nVous êtes autorisés à utiliser ce modèle de projet dans votre jeu commercial.\r\nVous n\'êtes pas autorisé à distribuer ou à revendre le code source, les actifs et les fichiers contenus dans ce package.\r\nVous êtes autorisé à distribuer ou à vendre l\'exécutable compilé créé à l\'aide de ceci.', 1, '/images/card-template-luna.jpg', 'La meilleur façon de démarrer une scène en deux dimensions vue de haut', 'Projet de démarrage'),
	(4, 'Odin', '/images/banner-template-odin.jpg', 'Odin banner', '60.00', 'Non disponible', '1.0.0', '3/10', '2D', 'Basique', 'Orienté RPG', 'Raijin', '2d, battle, stats, menu, rpg, pixel-art', '/images/template-odin-00.png, /images/template-odin-01.png, /images/template-odin-02.png, /images/template-odin-03.png, /images/template-odin-04.png, /images/template-odin-05.png', 'Odin est un starter-kit de jeu de role.\r\nCréez vos propres personnages, armes, objets, sorts et mécaniques afin de développer votre game design.   \r\nEt si cela ne suffit pas, vous pouvez facilement personnaliser le code selon vos besoins grâce à une base de code propre et bien structurée.   \r\n   \r\n**Fonctionnalités:**\r\n- Joueur\r\n    - Liste des héros\r\n    - Quantité d\'argent\r\n    - Inventaire\r\n- Personnage\r\n    - Nom\r\n    - Image avatar\r\n    - Sprite de combat\r\n    - Liste d\'effets\r\n    - Liste des sceaux actifs\r\n    - Gestion des statistiques avec modificateurs\r\n- Hero\r\n    - 4 objets d\'equipements différents\r\n- Effet\r\n    - Sprite de combat\r\n    - Lance une mécanique\r\n    - Cible un personnage correspondants aux critères de la condition de ciblage\r\n- Mécanique (facilement extensible)\r\n    - Restauration\r\n    - Dommage\r\n    - Augmentation du mana\r\n    - Réduction du mana\r\n    - Ajout d\'un sceaux\r\n    - Retire un sceaux\r\n- Sceaux\r\n    - Peut-être empilé ou non-empilé\r\n    - Durée de vie (en nombre de tour)\r\n    - Liste de modificateurs de stats (buf/debuf)\r\n    - Peut contenir un effet (celui-ci sera exécuté à chaque tour)\r\n- Objet commun\r\n    - Peut contenir un effet\r\n    - Utilisable en combat uniquement, hors combat uniquement ou les deux\r\n- Objet équipement\r\n    - Liste de modificateurs de stats\r\n    - Peut-être de 4 type différents (épée, armure, casque, amulette)\r\n    - Contient une sous-catégorie (epée_xxxx, épée_yyyy, etc...)\r\n- Système de combat tour par tour (deux dimensions)\r\n    - Attaques physiques\r\n    - Attaques magiques\r\n    - Utilisation d\'objets\r\n    - Gestion du buf/debuf\r\n    - Utilisation de sceaux (magies durable dans le temps)\r\n    - Implémentation d\'une IA configurable\r\n- Menu\r\n    - Menu inventaire (ajout/suppr/trier/filtrer)\r\n    - Menu armes/equipements (utiliser/suppr/trier/filtrer)\r\n    - Menu status\r\n- Magasin d\'armes\r\n    - Achat d\'objets\r\n    - Pré-visualisation des stats\r\n- Magasin d\'objets\r\n    - Achat d\'objets\r\n    - Pré-visualisation des effets applicables   \r\n    \r\n**Actifs artistiques:**\r\n- Image de fond\r\n- Sprites personnages\r\n- Sprites d\'effets   \r\n   \r\n**Licence:**   \r\nVous êtes autorisé à utiliser ce modèle de projet dans votre jeu commercial.\r\nVous n\'êtes pas autorisé à distribuer ou à revendre le code source, les actifs et les fichiers contenus dans ce package.\r\nVous êtes autorisé à distribuer ou à vendre l\'exécutable compilé créé à l\'aide de ceci.', 1, '/images/card-template-odin.jpg', 'La meilleur façon de démarrer un jeu de rôle', 'Projet de démarrage'),
	(5, 'Sai', '/images/banner-template-sai.jpg', 'Sai banner', '60.00', 'Non disponible', '1.0.0', '7/10', '2D', 'Basique', 'CCG', 'Raijin', '2d, battle, card, ccg', '/images/template-sai-00.png', 'Sai est un starter-kit de jeu de carte à collectionner.\r\nCréez vos propres cartes, effets, conditions d\'activation, déclencheurs et mécaniques afin de développer votre game design.   \r\nEt si cela ne suffit pas, vous pouvez facilement personnaliser le code selon vos besoins grâce à une base de code propre et bien structurée.   \r\n   \r\n**Fonctionnalités:**\r\n- Plateau\r\n    - Deux duelistes (pas d\'ia pour le moment)\r\n    - Invocation\r\n    - Poser\r\n    - Changement de position attaque/defense\r\n    - Pioche\r\n    - Attaque directe\r\n    - Attaque monstre\r\n    - Carte monstre (attaque/defense, race, élément)\r\n    - Carte magie (type, mode, element, effets)\r\n        - Activation manuelle pour le mode \'activable\'\r\n        - Déclenchement sous condition pour le mode \'déclenchable\'\r\n        - Envoyer au cimetière après activation pour le type \'normal\'\r\n        - Reste sur le terrain avec activation avec effet persistant pour le type \'continue\'\r\n    - Effets de cartes (type de ciblage, zone d\'influence, condition de ciblage, liaison de cartes)\r\n        - Ciblage unique pour le type \'seul\'\r\n        - Ciblage automatique et multiple pour le type \'champs\'\r\n        - Cible les cartes d\'une certaine zone du plateau\r\n        - Cible les cartes correspondants aux critères de la condition de ciblage\r\n        - Liaison d\'un effet à une carte\r\n    - 12 mécaniques différentes (facilement extensibles)\r\n    - 2 condition de ciblage (facilement extensibles)\r\n    - Découpage d\'un tour en plusieurs phases\r\n    - Menu d\'actions parmis celles autorisé lors de la phase courante\r\n    - Navigation dans le plateau avec ciblage en cascade\r\n   \r\n**Actifs artistiques:**\r\n- Images de fonds\r\n- Images de cartes\r\n   \r\n**Licence:**   \r\nVous êtes autorisé à utiliser ce modèle de projet dans votre jeu commercial.\r\nVous n\'êtes pas autorisé à distribuer ou à revendre le code source, les actifs et les fichiers contenus dans ce package.\r\nVous êtes autorisé à distribuer ou à vendre l\'exécutable compilé créé à l\'aide de ceci.', 1, '/images/card-template-sai.jpg', 'La meilleur façon de démarrer un jeu de carte à collectionner', 'Projet de démarrage'),
	(6, 'Thunar', '/images/banner-template-thunar.jpg', 'Thunar banner', '60.00', 'Non disponible', '1.0.0', '5/10', '3D Pré-calculée', 'Digital-art', 'Orienté RPG', 'Raijin', '3d, pre-rendered, rpg, pixel-art', '', 'Thunar est un starter-kit de navigation en trois dimensions avec fond pré-calculé, il est fortement recommandé de l\'utiliser conjointement avec le template\r\nOdin pour avoir un ensemble complet de jeu de role.\r\nCréez vos propres scènes, ajoutez des scripts, des objets, des déclencheurs et des personnages afin de développer votre histoire.\r\nEt si cela ne suffit pas, vous pouvez facilement personnaliser le code selon vos besoins grâce à une base de code propre et bien structurée.   	   \r\n   \r\n**Fonctionnalités:**\r\n- Joueur\r\n	- Système de variables utilisables dans les scripts (utile pour avancer dans l\'histoire)\r\n- Contrôle du joueur\r\n- Modèle animé avec déclenchement d\'évènements\r\n- Modèle invisible avec déclenchement d\'évènements\r\n- Ligne invisible permettant le mouvement des modèles\r\n- Points d\'apparitions\r\n- Commandes de scripts:\r\n	- Le joueur est bloqué\r\n	- La joueur est libre\r\n	- Attends un évènement clavier pour continuer\r\n	- Effectue un saut de script\r\n	- Effectue un saut de script seulement si la condition est validée\r\n	- Execute la commande seulement si la condition est validée\r\n	- Définit une valeur à une variable\r\n	- Ajoute une valeur à une variable\r\n	- Retranche une valeur à une variable\r\n	- Attends pendant x ms\r\n	- Affiche un dialogue\r\n	- Affiche un dialogue avec choix multiples\r\n	- Effectue un effet de fondu entrant\r\n	- Effectue un effet de fondu sortant\r\n	- Le modèle parcours la ligne invisible\r\n	- Le modèle joue une animation   \r\n   \r\n**Actifs artistiques:**\r\n- Background (ref: FF7) (livré avec le fichier Blender)\r\n- Personnages animées (ref:FF7)   \r\n   \r\n**Licence:**   \r\nVous êtes autorisé à utiliser ce modèle de projet dans votre jeu commercial.\r\nVous n\'êtes pas autorisé à distribuer ou à revendre le code source, les actifs et les fichiers contenus dans ce package.\r\nVous êtes autorisé à distribuer ou à vendre l\'exécutable compilé créé à l\'aide de ceci.', 1, '/images/card-template-thunar.jpg', 'La meilleur façon de démarrer une scène en trois dimensions pré-calculé', 'Projet de démarrage'),
	(7, 'Checker', '/images/banner-template-checker.jpg', 'Checker banner', '20.00', 'Non disponible', '1.0.0', '2/10', '2D', 'Basique', 'Plateau', 'Raijin', '2d, jeu de société, jeu de dames', ' ', 'Checker est un petit projet d\'exemple de jeu de dames. ', 1, '/images/card-template-checker.jpg', 'Un exemple simple de jeu de dames', 'Projet d\'exemple');
/*!40000 ALTER TABLE `project` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
