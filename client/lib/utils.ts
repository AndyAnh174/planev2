import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}

/**
 * Generate embed iframe code for public page
 */
export function generateEmbedCode(slug: string, width: number = 800, height: number = 600): string {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const embedUrl = `${baseUrl}/p/${slug}`;
  return `<iframe src="${embedUrl}" width="${width}" height="${height}" frameborder="0" allowfullscreen></iframe>`;
}
