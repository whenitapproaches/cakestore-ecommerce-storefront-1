// GLOBAL CUSTOM COMPONENTS
import HoverBox from "components/HoverBox";
import { H4 } from "components/Typography";
import LazyImage from "components/LazyImage";

// ==========================================================
type Props = { title: string; imgUrl: string };
// ==========================================================

export default function FeaturedProductCard({ imgUrl, title }: Props) {
  return (
    <div>
      <HoverBox borderRadius="5px" mb={1}>
        <LazyImage alt={title} width={831} height={546} src={imgUrl} />
      </HoverBox>

      <H4 fontSize={14}>{title}</H4>
    </div>
  );
}
