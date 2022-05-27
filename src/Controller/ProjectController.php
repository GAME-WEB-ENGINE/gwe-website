<?php

namespace App\Controller;

use App\Entity\Project;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class ProjectController extends AbstractController
{
  private $em;

  public function __construct(EntityManagerInterface $em)
  {
    $this->em = $em;
  }

  /**
   * @Route("/project/list", name="project-list")
   */
  public function list(): Response
  {
    return $this->render('project-list.html.twig', [
      'projects' => $this->em->getRepository(Project::class)->findAll()
    ]);
  }

  /**
   * @Route("/project/view/{id}", name="project-view")
   */
  public function view(Project $project): Response
  {
    return $this->render('project-view.html.twig', [
      'project' => $project
    ]);
  }
}