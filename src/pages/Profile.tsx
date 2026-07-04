import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Loader2, Mail, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { userService, UserProfileDto } from "@/services/userService";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function getInitials(displayName: string | null, email: string): string {
  if (displayName?.trim()) {
    return displayName.trim().split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2);
  }
  return email[0]?.toUpperCase() ?? "U";
}

const Profile = () => {
  const { user, updateUser, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    if (hasFetched.current) return;
    hasFetched.current = true;

    userService.getMyProfile()
      .then(p => {
        setProfile(p);
        setDisplayName(p.displayName ?? "");
        setPhone(p.phone ?? "");
        updateUser({ avatarUrl: p.avatarUrl });
      })
      .catch(() => toast({ title: "Erro ao carregar perfil", variant: "destructive" }))
      .finally(() => setIsLoading(false));
  }, [authLoading, user, navigate, toast, updateUser]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const updated = await userService.uploadAvatar(file);
      setProfile(updated);
      updateUser({ avatarUrl: updated.avatarUrl });
      toast({ title: "Foto de perfil atualizada" });
    } catch {
      toast({ title: "Erro ao enviar foto", variant: "destructive" });
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await userService.updateProfile({
        displayName: displayName.trim() || null,
        phone: phone.trim() || null,
        avatarUrl: profile?.avatarUrl ?? null,
      });
      setProfile(updated);
      updateUser({ displayName: updated.displayName });
      toast({ title: "Perfil atualizado com sucesso" });
    } catch {
      toast({ title: "Erro ao atualizar perfil", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const initials = getInitials(profile?.displayName ?? null, user?.email ?? "U");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-lg">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1 as never)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Meu Perfil</h1>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="flex justify-center mb-6">
              <Skeleton className="h-24 w-24 rounded-full" />
            </div>
            <Skeleton className="h-5 w-32 rounded mx-auto" />
            <Skeleton className="h-4 w-48 rounded mx-auto mb-2" />
            <Separator className="my-6" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative h-24 w-24 rounded-full overflow-hidden shadow-md group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary-foreground">{initials}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {isUploadingAvatar
                    ? <Loader2 className="h-6 w-6 text-white animate-spin" />
                    : <><Camera className="h-6 w-6 text-white" /><span className="text-white text-xs mt-1">Alterar</span></>
                  }
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <div className="text-center">
                <p className="font-semibold text-lg leading-tight">
                  {profile?.displayName ?? "Usuário"}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">{profile?.email}</p>
              </div>
            </div>

            <Separator />

            {/* Form */}
            <div className="space-y-5">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Informações pessoais
              </h2>

              <div className="space-y-1.5">
                <Label htmlFor="displayName" className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  Nome de exibição
                </Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Como você quer ser chamado"
                  maxLength={100}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  Telefone
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(92) 99999-9999"
                  maxLength={20}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  E-mail
                </Label>
                <Input
                  id="email"
                  value={profile?.email ?? ""}
                  disabled
                  className="opacity-60 cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado.</p>
              </div>

              <Button onClick={handleSave} disabled={isSaving} className="w-full mt-2">
                {isSaving
                  ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Salvando...</>
                  : "Salvar alterações"
                }
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
