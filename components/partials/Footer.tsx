import Container from "../layouts/Container";
import { SmallText } from "../texts/SmallText";

export default function Footer() {
	return (
		<footer className="bg-black">
			<Container>
				<div className="p-2 mx-auto text-center">
					<SmallText>&copy; {new Date().getFullYear()} Propann. All rights reserved.</SmallText>
				</div>
			</Container>
		</footer>
	);
}
