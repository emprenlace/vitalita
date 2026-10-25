import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { formatDate, imageUrl, type PostCard } from "@/lib/sanity";
import { cn } from "@/lib/utils";

export function PostCardView({ post, featured }: { post: PostCard; featured?: boolean }) {
  return (
    <article className={cn("blog-card", featured && "blog-card--featured")}>
      <Link to="/blog/$slug" params={{ slug: post.slug }} className="blog-card-link">
        <div className="blog-card-media">
          <img
            src={imageUrl(post.mainImage, featured ? 1200 : 640, featured ? 720 : 420)}
            alt={post.mainImage?.alt ?? ""}
            width={featured ? 1200 : 640}
            height={featured ? 720 : 420}
            loading={featured ? "eager" : "lazy"}
            decoding="async"
          />
        </div>
        <div className="blog-card-body">
          <p className="blog-card-meta">
            {post.category?.title}
            <span aria-hidden> · </span>
            {post.readingMinutes} min de lectura
          </p>
          <h2 className="blog-card-title">{post.title}</h2>
          <p className="blog-card-excerpt">{post.excerpt}</p>
          <p className="blog-card-foot">
            <span>
              {post.author?.name} · {formatDate(post.publishedAt)}
            </span>
            <ArrowUpRight aria-hidden />
          </p>
        </div>
      </Link>
    </article>
  );
}
