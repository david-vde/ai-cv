<?php

namespace App\ChatLogger;

enum ChatLogStatus: string
{
    case SUCCESS = 'success';
    case ERROR = 'error';
}
