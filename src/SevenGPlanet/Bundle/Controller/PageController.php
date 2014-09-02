<?php

namespace SevenGPlanet\Bundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

/**
 * Class PageController
 * @package SevenGPlanet\Bundle\Controller
 *
 * All page activation in the browser is routed through these actions.
 */
class PageController extends Controller
{
    public function mainPageAction()
    {
        /*
         * The action's view can be rendered using render() method
         * or @Template annotation as demonstrated in DemoController.
         */
        return $this->render('SevenGPlanetBundle:mainPage.html.twig');
    }
}
