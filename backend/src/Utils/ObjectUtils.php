<?php

namespace App\Utils;

class ObjectUtils
{
    /**
     * @param object $object
     * @param string $property
     * @param mixed $value
     * @return void
     * @throws \ReflectionException
     */
    static public function setPrivatePropertyValue(object $object, string $property, mixed $value): void
    {
        $reflection = new \ReflectionProperty(get_class($object), $property);
        $reflection->setAccessible(true);

        if ($reflection->isReadOnly()) {
            $declaringClass = $reflection->getDeclaringClass()->getName();
            \Closure::bind(function () use ($property, $value) {
                $this->$property = $value;
            }, $object, $declaringClass)();
        } else {
            $reflection->setValue($object, $value);
        }
    }

    /**
     * @param object $object
     * @param string $property
     * @return mixed
     * @throws \ReflectionException
     */
    static public function getPrivatePropertyValue(object $object, string $property): mixed
    {
        $reflection = new \ReflectionClass($object);
        $property = $reflection->getProperty($property);
        $property->setAccessible(true);
        return $property->getValue($object);
    }
}
