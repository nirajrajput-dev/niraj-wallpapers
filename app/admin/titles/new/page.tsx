import TitleForm from "@/components/admin/TitleForm";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function NewTitlePage() {
  // Check authentication
  const session = await getSession();
  if (!session.isLoggedIn) {
    redirect("/admin/login");
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Create New Title</h1>
        <p className="text-muted mt-2">Add a new wallpaper collection</p>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <TitleForm mode="create" />
      </div>
    </div>
  );
}
