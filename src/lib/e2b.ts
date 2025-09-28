import { Sandbox } from "@e2b/code-interpreter";

export interface RenderRequest {
  script: string;
  prompt: string;
}

export async function renderManimVideo({
  script,
  prompt: _prompt,
}: RenderRequest): Promise<string> {
  let sandbox: Sandbox | null = null;

  try {
    sandbox = await Sandbox.create("manim-ffmpeg-latex-voiceover", {
      timeoutMs: 1200000,
    });
    console.log("E2B sandbox created successfully");

    const scriptPath = `/home/user/script.py`;
    const mediaDir = `/home/user/media`;
    const outputDir = `${mediaDir}/videos/script/480p15`;

    // Write Manim script
    await sandbox.files.write(scriptPath, script);
    console.log("Manim script written to sandbox");

    const checkLatex = await sandbox.commands.run(`latex --version`, {
      onStdout: (d) => console.log(d),
      onStderr: (d) => console.error(d),
    });

    if (checkLatex.exitCode !== 0) {
      throw new Error(
        `Latex failed: ${checkLatex.exitCode}\n${checkLatex.stderr}`
      );
    }

    // Run manim
    const proc = await sandbox.commands.run(
      `manim ${scriptPath} MyScene --media_dir ${mediaDir} -ql --disable_caching --format=mp4`,
      {
        onStdout: (d) => console.log(d),
        onStderr: (d) => console.error(d),
      }
    );

    if (proc.exitCode !== 0) {
      throw new Error(`Manim failed: ${proc.exitCode}\n${proc.stderr}`);
    }

    // Find output file
    const files = (await sandbox.files.list(outputDir)) as Array<{
      name: string;
    }>;
    const videoFile = files.find((f) => f.name.endsWith(".mp4"));
    if (!videoFile) throw new Error("No .mp4 file produced");

    const videoPath = `${outputDir}/${videoFile.name}`;
    console.log("Video file candidate:", videoPath);

    // Validate with ffprobe
    const probe = await sandbox.commands.run(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${videoPath}`
    );
    const duration = parseFloat((probe.stdout || "").trim());
    console.log("ffprobe duration:", duration);

    if (!duration || duration <= 0) {
      throw new Error("Rendered video has 0s duration — aborting upload");
    }

    // Read file bytes reliably via base64 in the sandbox to avoid encoding issues
    const base64Result = await sandbox.commands.run(`base64 -w 0 ${videoPath}`);
    if (base64Result.exitCode !== 0 || !base64Result.stdout) {
      throw new Error(
        `Failed to base64-encode video in sandbox: ${
          base64Result.stderr || "no stdout"
        }`
      );
    }
    const base64 = (base64Result.stdout || "").trim();
    const dataUrl = `data:video/mp4;base64,${base64}`;
    console.log(
      `Prepared base64 data URL for upload (length: ${base64.length} chars)`
    );
    return dataUrl;
  } catch (err: any) {
    console.error("E2B render error:", err);
    throw new Error(`Failed to render Manim video: ${err.message}`);
  } finally {
    console.log("E2B sandbox will be closed by the framework");
  }
}
