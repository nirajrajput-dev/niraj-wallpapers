import TitleForm from "@/components/admin/TitleForm";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import connectDB from "@/lib/mongodb";
import Title from "@/lib/models/Title";

async function getTitle(id: string) {
  try {
    await connectDB();
    const title = await Title.findById(id).lean();
    if (!title) return null;

    return {
      ...title,
      _id: title._id.toString(),
    };
  } catch (error) {
    console.error("Error fetching title:", error);
    return null;
  }
}

export default async function EditTitlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Check authentication
  const session = await getSession();
  if (!session.isLoggedIn) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const title = await getTitle(id);

  if (!title) {
    notFound();
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Edit Title</h1>
        <p className="text-muted mt-2">Update wallpaper collection details</p>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <TitleForm mode="edit" initialData={title} />
      </div>
    </div>
  );
}
