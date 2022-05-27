<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220526232004 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE addon ADD description LONGTEXT NOT NULL, CHANGE tags tags LONGTEXT NOT NULL');
        $this->addSql('ALTER TABLE project CHANGE tags tags LONGTEXT NOT NULL, CHANGE closeups closeups LONGTEXT NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE addon DROP description, CHANGE tags tags LONGTEXT NOT NULL COMMENT \'(DC2Type:array)\'');
        $this->addSql('ALTER TABLE project CHANGE tags tags LONGTEXT NOT NULL COMMENT \'(DC2Type:array)\', CHANGE closeups closeups LONGTEXT NOT NULL COMMENT \'(DC2Type:array)\'');
    }
}
