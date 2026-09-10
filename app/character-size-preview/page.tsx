import { notFound } from "next/navigation";
import SizePreview from "./SizePreview";

export default function Page() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <SizePreview />;
}
