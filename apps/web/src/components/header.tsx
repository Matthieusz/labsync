import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./language-switcher";

export default function Header() {
  const { t } = useTranslation();
  const links = [
    { to: "/", label: t("common.home") },
    { to: "/dashboard", label: t("common.dashboard") },
    { to: "/todos", label: t("common.todos") },
  ] as const;

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          {links.map(({ to, label }) => (
            <Link key={to} to={to}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
        </div>
      </div>
      <hr />
    </div>
  );
}
