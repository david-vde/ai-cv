<?php

namespace App\Transcriber;

use App\Model\AudioFile;
use OpenAI\Contracts\ClientContract;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

class OpenAIAudioAudioTranscriber implements AudioTranscriberInterface
{
    private ClientContract $client;

    /**
     * @param string $openAiApiKey
     */
    public function __construct(
        #[Autowire(env: 'OPEN_AI_API_PRIVATE_KEY')] string $openAiApiKey)
    {
        $this->client = \OpenAI::client($openAiApiKey);
    }

    /**
     * @param AudioFile $audio
     * @return string
     */
    public function transcribe(AudioFile $audio): string
    {
        $file = fopen($audio->fileName, 'r');

        if (!$file) {
            throw new \RuntimeException('Failed to open audio file for transcription.');
        }

        $response = $this->client->audio()->transcribe([
            'model' => 'whisper-1',
            'file' => $file
        ]);

        return $response->text;
    }


}
