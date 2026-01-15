"use client";

import { useState } from "react";
import Link from "next/link";
import Hamburger from "../buttons/Hamburger";
import Container from "../layouts/Container";
import Dropdown from "../buttons/Dropdown";
import PrimaryButton from "../buttons/PrimaryButton";
import SecondaryButton from "../buttons/SecondaryButton";

const menuItems = [
	{
		label: "Buy",
		type: "dropdown",
		links: [
			{ label: "Residential", href: "/residential" },
			{ label: "Commercial", href: "/commercial" },
		],
	},
	{
		label: "Rent",
		type: "dropdown",
		links: [
			{ label: "Short Term", href: "/short-term" },
			{ label: "Long Term", href: "/long-term" },
		],
	},
	{ label: "Upcoming Projects", href: "/upcoming", type: "link" },
	{
		label: "Properties By Location",
		type: "dropdown",
		links: [
			{ label: "Bangalore", href: "/bangalore" },
			{ label: "Mumbai", href: "/mumbai" },
			{ label: "Delhi", href: "/delhi" },
		],
	},
	{ label: "Sign In", href: "/auth/signin", type: "button", primary: true },
	{ label: "Sign Up", href: "/auth/signup", type: "button", primary: false },
];

function HeaderMenus({
	mobile = false,
	closeMenu,
}: {
	mobile?: boolean;
	closeMenu?: () => void;
}) {
	return (
		<nav
			className={`${
				mobile ? "flex flex-col gap-4" : "hidden lg:flex items-center gap-4"
			}`}
		>
			{menuItems.map((item, index) => {
				if (item.type === "dropdown") {
					return <Dropdown key={index} label={item.label} links={item.links} />;
				}
				if (item.type === "button") {
					const Button = item.primary ? PrimaryButton : SecondaryButton;

					return (
						<Button key={index} href={item.href!}>
							{item.label}
						</Button>
					);
				}

				return (
					<Link
						key={index}
						href={item.href!}
						className="text-gray-700 hover:text-black"
						onClick={closeMenu}
					>
						{item.label}
					</Link>
				);
			})}
		</nav>
	);
}

export default function Header() {
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<header className="sticky top-0 z-50 bg-white">
			<Container>
				<div className="flex items-center justify-between py-4 px-2">
					<h1 className="text-2xl font-bold uppercase">REAL ESTATE</h1>

					{/* Desktop Menu */}
					<HeaderMenus />

					{/* Hamburger */}
					<Hamburger open={menuOpen} onClick={() => setMenuOpen(!menuOpen)} />
				</div>
			</Container>

			{/* Mobile Menu Overlay */}
			{menuOpen && (
				<div
					className="lg:hidden fixed inset-0 z-40 bg-black/40"
					onClick={() => setMenuOpen(false)}
				>
					<div
						className="absolute left-0 top-0 h-full w-64 bg-white p-6 shadow-lg overflow-y-auto"
						onClick={(e) => e.stopPropagation()}
					>
						<HeaderMenus mobile closeMenu={() => setMenuOpen(false)} />
					</div>
				</div>
			)}
		</header>
	);
}
