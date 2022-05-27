<?php

namespace App\Controller;

use App\Entity\Addon;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class AddonController extends AbstractController
{
  private $em;

  public function __construct(EntityManagerInterface $em)
  {
    $this->em = $em;
  }

  /**
   * @Route("/addon/list", name="addon-list")
   */
  public function list(): Response
  {
    return $this->render('addon-list.html.twig', [
      'addons' => $this->em->getRepository(Addon::class)->findAll()
    ]);
  }
}