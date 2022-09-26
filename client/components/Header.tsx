import { CurrentUser, Maybe } from "@src/types";
import { NextPage } from "next";
import Link from "next/link";

interface IHeaderProps {
  currentUser: Maybe<CurrentUser>;
}

const Header: NextPage<IHeaderProps> = ({ currentUser }) => {
  const links = [
    { label: "Sign Up", href: "/auth/signup", display: !currentUser },
    { label: "Sign In", href: "/auth/signin", display: !currentUser },
    { label: "Sell Tickets", href: "/tickets/new", display: currentUser },
    { label: "My Orders", href: "/orders", display: currentUser },
    { label: "Sign Out", href: "/auth/signout", display: currentUser },
  ];

  return (
    <nav className="navbar navbar-light bg-light">
      <Link href="/">
        <a className="navbar-brand px-3">Trense Tickets</a>
      </Link>

      <div className="d-flex justify-content-end">
        <ul className="nav d-flex align-items-center">
          {links.map((link, idx) => {
            return (
              link.display && (
                <li key={idx}>
                  <Link href={link.href}>
                    <a className="nav-link">{link.label}</a>
                  </Link>
                </li>
              )
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default Header;
