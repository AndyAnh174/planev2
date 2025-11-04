import { Metadata } from "next";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    // Fetch page data directly (server-side)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const response = await fetch(`${apiUrl}/pages/public/${params.slug}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        title: "Public Page",
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const page = await response.json();

    if (!page || !page.isIndexed) {
      return {
        title: page?.title || "Public Page",
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    // Extract description from first text block
    const firstTextBlock = page.blocks?.find(
      (block: any) => block.type === "text" || block.type === "heading"
    );
    const description =
      firstTextBlock?.content?.text ||
      (firstTextBlock?.content?.html
        ? firstTextBlock.content.html.replace(/<[^>]*>/g, "").slice(0, 160)
        : "") ||
      page.title;

    const pageUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/p/${page.slug}`;

    return {
      title: page.title,
      description: description.substring(0, 160),
      openGraph: {
        title: page.title,
        description: description.substring(0, 160),
        url: pageUrl,
        type: "article",
        publishedTime: page.createdAt,
        modifiedTime: page.updatedAt,
        authors: page.author?.username ? [page.author.username] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: page.title,
        description: description.substring(0, 160),
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    return {
      title: "Public Page",
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default function PublicPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

