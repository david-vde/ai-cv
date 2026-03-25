<?php

namespace App\DataFixtures;

use App\Entity\Config;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class ConfigFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $skills = [
            ['Skill 1', '1c2e4a', '79c0ff', '1f6feb'],
            ['Skill 2', '1c2e1c', '7ee787', '238636'],
            ['Skill 3', '2a1f1a', 'ffa657', 'bd5b10']
        ];

        $configs = [
            'contact.firstname' => 'Doe',
            'contact.lastname' => 'John',
            'contact.profession' => 'Physicist',
            'contact.experience_years' => 5,
            'contact.email' => 'john@doe',
            'contact.phone' => '+123456789',
            'contact.linkedin' => 'https://www.linkedin.com',
            'contact.github' => 'https://github.com',
            'contact.chatbot_github_repository' => 'https://github.com/{repo_name}',
            'contact.skill_tags' => json_encode($skills),
            'contact.cv_url' => 'https://example.com/cv.pdf',
        ];

        foreach ($configs as $key => $value) {
            $config = new Config();
            $config->setName($key);
            $config->setData($value);
            $manager->persist($config);
        }

        $manager->flush();
    }
}
