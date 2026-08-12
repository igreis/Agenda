"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, CalendarDays, Users, Stethoscope, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { criarClienteNavegador } from "@/lib/supabase/client";

const links = [
  { href: "/", label: "Painel", icon: LayoutGrid },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/pacientes", label: "Pacientes", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    setSaindo(true);
    const supabase = criarClienteNavegador();
    await supabase.auth.signOut();
    setIsOpen(false);
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-ink-900 text-white px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500/90">
            <Stethoscope className="h-4 w-4 text-white" strokeWidth={2.2} />
          </div>
          <span className="font-display font-bold leading-tight tracking-tight">DentaAgenda</span>
        </div>
        <button onClick={() => setIsOpen(true)} className="p-1 text-white/80 hover:text-white">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 h-screen z-50 w-64 shrink-0 bg-ink-900 text-white flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="flex items-center justify-between px-5 py-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/90">
              <Stethoscope className="h-5 w-5 text-white" strokeWidth={2.2} />
            </div>
            <div>
              <p className="font-display text-[15px] font-bold leading-tight tracking-tight">
                DentaAgenda
              </p>
              <p className="text-xs text-white/50">Gestão de consultas</p>
            </div>
          </div>
          <button className="md:hidden p-1 text-white/50 hover:text-white" onClick={() => setIsOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-2 flex-1 space-y-1 px-3 overflow-y-auto">
          {links.map(({ href, label, icon: Icon }) => {
            const ativo = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  ativo
                    ? "bg-brand-500 text-white shadow-sm"
                    : "text-white/65 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-5 py-4">
          <p className="text-sm font-semibold text-white/90">Consultório Solo</p>
          <p className="text-xs text-white/45">Dra. Responsável</p>
          <button
            type="button"
            onClick={sair}
            disabled={saindo}
            className="mt-4 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-white/65 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={2} />
            {saindo ? "Saindo..." : "Sair"}
          </button>
        </div>
      </aside>
    </>
  );
}
