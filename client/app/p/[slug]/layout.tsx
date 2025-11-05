import { Metadata } from "next";
import { notFound } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function getPageData(slug: string) {
  try {
    const res = await fetch(`${API_URL}/pages/public/${slug}`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageData(slug);

  if (!page) {
    return {
      title: "Page Not Found",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const pageUrl = `${baseUrl}/p/${page.slug}`;
  interface Block {
    type: string;
    content?: {
      text?: string;
    };
  }
  
  const description = page.blocks
    ?.map((block: Block) => {
      if (block.type === "text" || block.type === "heading") {
        return block.content?.text || "";
      }
      return "";
    })
    .join(" ")
    .substring(0, 160) || `View ${page.title} on PlaneV2.0`;

  return {
    title: page.title,
    description,
    openGraph: {
      title: page.title,
      description,
      url: pageUrl,
      siteName: "PlaneV2.0",
      type: "article",
      ...(page.author && {
        authors: [page.author.username || page.author.email],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description,
    },
    alternates: {
      canonical: pageUrl,
    },
    robots: page.isIndexed
      ? {
          index: true,
          follow: true,
        }
      : {
          index: false,
          follow: false,
        },
  };
}

export default async function PublicPageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPageData(slug);

  if (!page) {
    notFound();
  }

  return <>{children}</>;
}
