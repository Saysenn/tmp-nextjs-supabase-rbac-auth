import { Props } from "@/types/header";

export function SmallText({ children }: Props) {
	return <p className="text-xs sm:text-sm text-white">{children}</p>;
}