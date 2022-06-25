<?php

namespace App\Entity;

use App\Repository\ProjectRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ProjectRepository::class)]
class Project
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private $id;

    #[ORM\Column(type: 'string', length: 255)]
    private $name;

    #[ORM\Column(type: 'string', length: 255)]
    private $banner;

    #[ORM\Column(type: 'string', length: 255)]
    private $banner_alt;

    #[ORM\Column(type: 'string', length: 255)]
    private $version;

    #[ORM\Column(type: 'string', length: 255)]
    private $difficulty;

    #[ORM\Column(type: 'string', length: 255)]
    private $projection;

    #[ORM\Column(type: 'string', length: 255)]
    private $graphics;

    #[ORM\Column(type: 'string', length: 255)]
    private $genre;

    #[ORM\Column(type: 'string', length: 255)]
    private $author;

    #[ORM\Column(type: 'text')]
    private $tags = [];

    #[ORM\Column(type: 'text')]
    private $closeups = [];

    #[ORM\Column(type: 'text')]
    private $md;

    #[ORM\Column(type: 'string', length: 255)]
    private $thumbnail;

    #[ORM\Column(type: 'string', length: 255)]
    private $description;

    #[ORM\Column(type: 'string', length: 255)]
    private $type;

    #[ORM\Column(type: 'string', length: 255)]
    private $link;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    public function getBanner(): ?string
    {
        return $this->banner;
    }

    public function setBanner(string $banner): self
    {
        $this->banner = $banner;

        return $this;
    }

    public function getBannerAlt(): ?string
    {
        return $this->banner_alt;
    }

    public function setBannerAlt(string $banner_alt): self
    {
        $this->banner_alt = $banner_alt;

        return $this;
    }

    public function getVersion(): ?string
    {
        return $this->version;
    }

    public function setVersion(string $version): self
    {
        $this->version = $version;

        return $this;
    }

    public function getDifficulty(): ?string
    {
        return $this->difficulty;
    }

    public function setDifficulty(string $difficulty): self
    {
        $this->difficulty = $difficulty;

        return $this;
    }

    public function getProjection(): ?string
    {
        return $this->projection;
    }

    public function setProjection(string $projection): self
    {
        $this->projection = $projection;

        return $this;
    }

    public function getGraphics(): ?string
    {
        return $this->graphics;
    }

    public function setGraphics(string $graphics): self
    {
        $this->graphics = $graphics;

        return $this;
    }

    public function getGenre(): ?string
    {
        return $this->genre;
    }

    public function setGenre(string $genre): self
    {
        $this->genre = $genre;

        return $this;
    }

    public function getAuthor(): ?string
    {
        return $this->author;
    }

    public function setAuthor(string $author): self
    {
        $this->author = $author;

        return $this;
    }

    public function getTags(): ?string
    {
        return $this->tags;
    }

    public function setTags(string $tags): self
    {
        $this->tags = $tags;

        return $this;
    }

    public function getCloseups(): ?string
    {
        return $this->closeups;
    }

    public function setCloseups(string $closeups): self
    {
        $this->closeups = $closeups;

        return $this;
    }

    public function getMd(): ?string
    {
        return $this->md;
    }

    public function setMd(string $md): self
    {
        $this->md = $md;

        return $this;
    }

    public function getThumbnail(): ?string
    {
        return $this->thumbnail;
    }

    public function setThumbnail(string $thumbnail): self
    {
        $this->thumbnail = $thumbnail;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): self
    {
        $this->description = $description;

        return $this;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): self
    {
        $this->type = $type;

        return $this;
    }

    public function getLink(): ?string
    {
        return $this->link;
    }

    public function setLink(string $link): self
    {
        $this->link = $link;

        return $this;
    }
}
