import Container from "../layouts/Container";
import { SmallText } from "../texts/SmallText";

export default function Nav() {
	return (
		<nav className="w-full border-b border-gray-200 sticky top-0 z-50 bg-black">
			<Container>
				<div className="flex justify-between py-2 sm:px-2 px-2 ">
					<div className="hidden sm:block w-full">
						<SmallText>
							Discover Best and Affordable Properties in UAE
						</SmallText>
					</div>
					<div className="flex gap-4 justify-end w-full">
						<SmallText>About</SmallText>
						<SmallText>Career</SmallText>
						<SmallText>Contact Us</SmallText>
					</div>
				</div>
			</Container>
		</nav>
	);
}
