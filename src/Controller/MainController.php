<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class MainController extends AbstractController
{
  /**
   * @Route("/", name="home")
   */
  public function index(): Response
  {
    return $this->render('home.html.twig');
  }

  /**
   * @Route("/getting-started", name="getting-started")
   */
  public function gettingStarted(): Response
  {
    return $this->render('getting-started.html.twig');
  }

  /**
   * @Route("/tools", name="tools")
   */
  public function tools(): Response
  {
    return $this->render('tools.html.twig');
  }

  /**
   * @Route("/documentation/{file}", name="documentation")
   */
  public function documentation(string $file): Response
  {
    return $this->render('documentation.html.twig', [
      'file' => $file
    ]);
  }
}