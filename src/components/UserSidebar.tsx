import { useNavigate } from "react-router-dom";
import { User, Package, MapPin, Shield, LogOut, ChevronRight } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";

interface UserSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive";
}

function NavItem({ icon: Icon, label, onClick, variant = "default" }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors group
        ${variant === "destructive"
          ? "text-destructive hover:bg-destructive/10"
          : "text-foreground hover:bg-muted"}`}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 opacity-60 group-hover:opacity-100 transition-opacity" />
        {label}
      </div>
      {variant !== "destructive" && (
        <ChevronRight className="h-4 w-4 opacity-30 group-hover:opacity-60 transition-opacity" />
      )}
    </button>
  );
}

function getInitials(displayName: string | null, email: string): string {
  if (displayName?.trim()) {
    return displayName.trim().split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2);
  }
  return email[0]?.toUpperCase() ?? "U";
}

const UserSidebar = ({ isOpen, onClose }: UserSidebarProps) => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const go = (path: string) => { navigate(path); onClose(); };

  const handleSignOut = async () => {
    onClose();
    await signOut();
    navigate("/");
  };

  if (!user) return null;

  const initials = getInitials(user.displayName, user.email);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[300px] p-0 flex flex-col gap-0">
        {/* Profile header */}
        <div className="px-6 py-8 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-md overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-primary-foreground">{initials}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold leading-tight truncate">
                {user.displayName ?? "Usuário"}
              </p>
              <p className="text-sm text-muted-foreground truncate mt-0.5">{user.email}</p>
              {isAdmin && (
                <span className="mt-1.5 inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  <Shield className="h-3 w-3" />
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 pt-2 pb-2">
            Minha conta
          </p>
          <NavItem icon={User}    label="Meu Perfil"     onClick={() => go("/perfil")}         />
          <NavItem icon={Package} label="Meus Pedidos"   onClick={() => go("/meus-pedidos")}   />
          <NavItem icon={MapPin}  label="Meus Endereços" onClick={() => go("/meus-enderecos")} />

          {isAdmin && (
            <>
              <Separator className="my-3" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 pb-2">
                Administração
              </p>
              <NavItem icon={Shield} label="Painel Admin" onClick={() => go("/admin")} />
            </>
          )}
        </nav>

        {/* Sign out */}
        <div className="p-3 border-t">
          <NavItem icon={LogOut} label="Sair" onClick={handleSignOut} variant="destructive" />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default UserSidebar;
