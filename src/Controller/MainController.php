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
    return $this->render('main/home.html.twig');
  }

  /**
   * @Route("/getting-started", name="getting-started")
   */
  public function gettingStarted(): Response
  {
    return $this->render('main/getting-started.html.twig', [
      'controller_name' => 'MainController',
    ]);
  }

  /**
   * @Route("/templates", name="templates")
   */
  public function templates(): Response
  {
    return $this->render('main/templates.html.twig', [
      'controller_name' => 'MainController',
    ]);
  }

  /**
   * @Route("/templates-jessie", name="templates-jessie")
   */
  public function templateJessie(): Response
  {
    return $this->render('templates/jessie.html.twig', [
      'controller_name' => 'MainController',
    ]);
  }

  /**
   * @Route("/templates-luna", name="templates-luna")
   */
  public function templateLuna(): Response
  {
    return $this->render('templates/luna.html.twig', [
      'controller_name' => 'MainController',
    ]);
  }

  /**
   * @Route("/templates-odin", name="templates-odin")
   */
  public function templateOdin(): Response
  {
    return $this->render('templates/odin.html.twig', [
      'controller_name' => 'MainController',
    ]);
  }

  /**
   * @Route("/templates-sai", name="templates-sai")
   */
  public function templateSai(): Response
  {
    return $this->render('templates/sai.html.twig', [
      'controller_name' => 'MainController',
    ]);
  }

  /**
   * @Route("/templates-thunar", name="templates-thunar")
   */
  public function templateThunar(): Response
  {
    return $this->render('templates/thunar.html.twig', [
      'controller_name' => 'MainController',
    ]);
  }

  /**
   * @Route("/templates-edgar", name="templates-edgar")
   */
  public function templateEdgar(): Response
  {
    return $this->render('templates/edgar.html.twig', [
      'controller_name' => 'MainController',
    ]);
  }
}