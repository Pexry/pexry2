import { LibraryView } from "@/modules/library/ui/views/library-view";

// Force dynamic rendering to avoid slow static generation
export const dynamic = 'force-dynamic';

const Page = () => {
  return <LibraryView />;
}

export default Page;