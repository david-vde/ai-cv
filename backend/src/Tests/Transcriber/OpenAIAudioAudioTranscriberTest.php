<?php

namespace App\Tests\Transcriber;

use App\Model\AudioFile;
use App\Transcriber\OpenAIAudioAudioTranscriber;
use App\Utils\ObjectUtils;
use OpenAI\Contracts\TransporterContract;
use OpenAI\ValueObjects\Transporter\AdaptableResponse;
use PHPUnit\Framework\TestCase;

final class OpenAIAudioAudioTranscriberTest extends TestCase
{
    private string $openAiApiKey = 'openai_api_key';
    private ?OpenAIAudioAudioTranscriber $audioTranscriber;
    private string $tempFile;

    /**
     * @return void
     */
    protected function setUp(): void
    {
        $this->audioTranscriber = new OpenAIAudioAudioTranscriber($this->openAiApiKey);
        $this->tempFile = tempnam(sys_get_temp_dir(), 'audio_test_') . '.wav';
        file_put_contents($this->tempFile, 'fake audio content');
    }

    /**
     * @return void
     */
    protected function tearDown(): void
    {
        $this->audioTranscriber = null;
        if (file_exists($this->tempFile)) {
            unlink($this->tempFile);
        }
    }

    /**
     * @return void
     * @throws \ReflectionException
     */
    public function testTranscribeReturnsText(): void
    {
        $expectedText = 'Hello, this is a transcription test.';

        $mockTransporter = $this->createMock(TransporterContract::class);
        $mockTransporter
            ->method('requestStringOrObject')
            ->willReturn(AdaptableResponse::from(
                [
                    'task' => 'transcribe',
                    'language' => 'en',
                    'duration' => 1.0,
                    'segments' => [],
                    'words' => [],
                    'text' => $expectedText,
                ],
                []
            ));

        $newClient = (new \ReflectionClass(\OpenAI\Client::class))->newInstanceWithoutConstructor();
        ObjectUtils::setPrivatePropertyValue($newClient, 'transporter', $mockTransporter);
        ObjectUtils::setPrivatePropertyValue($this->audioTranscriber, 'client', $newClient);

        $audioFile = new AudioFile($this->tempFile, 'audio/wav');
        $result = $this->audioTranscriber->transcribe($audioFile);

        $this->assertSame($expectedText, $result);
    }

    /**
     * @return void
     */
    public function testTranscribeThrowsRuntimeExceptionWhenFileNotFound(): void
    {
        $audioFile = new AudioFile('/non/existent/file.wav', 'audio/wav');

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Failed to open audio file for transcription.');

        $this->audioTranscriber->transcribe($audioFile);
    }

    /**
     * @return void
     * @throws \ReflectionException
     */
    public function testTranscribeThrowsWhenApiReturnsError(): void
    {
        $mockTransporter = $this->createMock(TransporterContract::class);
        $mockTransporter
            ->method('requestStringOrObject')
            ->willThrowException(
                new \Exception('OpenAI API error')
            );

        $newClient = (new \ReflectionClass(\OpenAI\Client::class))->newInstanceWithoutConstructor();
        ObjectUtils::setPrivatePropertyValue($newClient, 'transporter', $mockTransporter);
        ObjectUtils::setPrivatePropertyValue($this->audioTranscriber, 'client', $newClient);

        $audioFile = new AudioFile($this->tempFile, 'audio/wav');

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('OpenAI API error');

        $this->audioTranscriber->transcribe($audioFile);
    }
}
