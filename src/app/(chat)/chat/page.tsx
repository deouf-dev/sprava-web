export default function ChatHomePage() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="text-center space-y-2">
        <div className="text-lg font-semibold">
          Sélectionne une conversation
        </div>
        <div className="text-sm text-muted-foreground">
          Choisis un contact dans la colonne de gauche pour commencer.
        </div>
      </div>
    </div>
  );
}
