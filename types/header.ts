export type Props = {
	children: React.ReactNode;
};

export type HamburgerProps = {
  onClick?: () => void
  open?: boolean
}

export type DropdownProps = {
  key?: number;
  label: string;
  href?: string;
  links?: { label: string; href: string }[];
}

export type MegaMenuProps = {
  title: string;
  items: { label: string; href: string }[];
  icon?: React.ReactNode;
  template?: string;
}