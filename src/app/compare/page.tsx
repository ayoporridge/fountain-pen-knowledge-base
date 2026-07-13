import { permanentRedirect } from "next/navigation";

export default function RetiredComparePage() {
  permanentRedirect("/browse?type=pen");
}
