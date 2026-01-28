export const translations = {
  fr: {
    // Common
    common: {
      loading: "Chargement…",
      error: "Erreur",
      unknownError: "Erreur inconnue",
      save: "Sauvegarder",
      saving: "Sauvegarde…",
      close: "Fermer",
      cancel: "Annuler",
      online: "En ligne",
      offline: "Hors ligne",
      user: "Utilisateur",
    },

    // Home page
    home: {
      welcome: "Bienvenue sur Sprava",
      description: "Une messagerie simple, rapide et moderne.",
      login: "Se connecter",
      createAccount: "Créer un compte",
    },

    // Login page
    login: {
      title: "Connexion",
      description: "Accède à ta messagerie.",
      email: "Adresse e-mail",
      password: "Mot de passe",
      submit: "Se connecter",
      submitting: "Connexion...",
      noAccount: "Pas encore de compte ?",
      createAccount: "Créer un compte",
      errorCredentials: "Erreur de connexion, vérifier vos identifiants.",
    },

    // Signup page
    signup: {
      title: "Inscription",
      description: "Crée ton compte pour accéder à la messagerie.",
      email: "Adresse e-mail",
      username: "Nom d'utilisateur",
      password: "Mot de passe",
      dateOfBirth: "Date de naissance",
      submit: "S'inscrire",
      submitting: "Inscription...",
      hasAccount: "Déjà un compte ?",
      login: "Se connecter",
    },

    // Chat
    chat: {
      selectConversation: "Sélectionne une conversation",
      selectConversationHint:
        "Choisis un contact dans la colonne de gauche pour commencer.",
      noConversation: "Aucune conversation.",
      loadMore: "Remonte pour charger plus",
      writeMessage: "Écrire un message…",
      send: "Envoyer",
      removeFile: "Retirer",
      addFile: "Ajouter un fichier",
      copy: "Copier",
      delete: "Supprimer",
    },

    // Friends
    friends: {
      myFriends: "Mes amis",
      title: "Mes amis",
      description:
        "Recherche un ami, gère les demandes, ou ajoute quelqu'un par son nom d'utilisateur.",
      friendsTab: "Amis",
      requestsTab: "Demandes",
      searchPlaceholder: "Rechercher un nom d'utilisateur...",
      loadingFriends: "Chargement de tes amis…",
      openConversation: "Ouvrir la conversation",
      minChars: "Tape au moins 3 caractères.",
      searching: "Recherche…",
      noUserFound: "Aucun utilisateur trouvé.",
      alreadyFriend: "Déjà dans tes amis",
      sendFriendRequest: "Envoyer une demande d'ami",
      requestSent: "Demande d'ami envoyée.",
      requestFailed: "Impossible d'envoyer la demande.",
      openConversationFailed: "Impossible d'ouvrir la conversation.",
      noRequests: "Aucune demande.",
      friendRequest: "Demande d'ami",
      accept: "Accepter",
      reject: "Refuser",
    },

    // User menu
    userMenu: {
      settings: "Paramètres",
      lightMode: "Mode clair",
      darkMode: "Mode nuit",
      logout: "Se déconnecter",
    },

    // Settings dialog
    settings: {
      title: "Paramètres",
      subtitle: "Sprava",
      myProfile: "Mon profil",
      myAccount: "Mon compte",
      security: "Sécurité",
      blockedUsers: "Utilisateurs bloqués",

      // My profile tab
      profileDescription: "Ton profil visible (bio, localisation, site) + avatar.",
      avatar: "Avatar",
      avatarHint: "PNG/JPG, max 5MB.",
      information: "Informations",
      bio: "Bio",
      bioPlaceholder: "Quelques mots sur toi…",
      location: "Localisation",
      locationPlaceholder: "Ex: Paris",
      website: "Site",
      websitePlaceholder: "https://…",
      sharingSettingsHint:
        'Tes paramètres de partage se trouvent dans l\'onglet "Sécurité".',

      // Account tab
      accountDescription: "Identité et informations de compte.",
      account: "Compte",
      usernameLabel: "Nom d'utilisateur",
      emailLabel: "Email",
      dateOfBirthLabel: "Date de naissance",
      newPasswordLabel: "Nouveau mot de passe",
      newPasswordPlaceholder: "Laisse vide pour ne pas changer",

      // Security tab
      securityDescription: "Contrôle ce que tu partages avec les autres.",
      sharingInfo: "Partage des informations",
      sharingInfoHint: "Choisis qui peut voir tes informations personnelles.",
      whoCanSeeLocation: "Qui peut voir ta localisation",
      whoCanSeeEmail: "Qui peut voir ton email",
      whoCanSeePhone: "Qui peut voir ton numéro",
      whoCanSeeDob: "Qui peut voir ta date de naissance",
      phone: "Téléphone",
      everyone: "Tout le monde",
      friendsOnly: "Amis uniquement",
      nobody: "Personne",
      securityTip:
        '💡 Astuce : "Amis uniquement" permet à tes amis de voir tes informations. "Tout le monde" les rend visibles publiquement.',

      // Blocked tab
      blockedDescription: "Gère les utilisateurs que tu as bloqués.",
      noBlockedUsers: "Aucun utilisateur bloqué.",
      blocked: "Bloqué",
      unblock: "Débloquer",
      userUnblocked: "Utilisateur débloqué.",
      unblockFailed: "Impossible de débloquer l'utilisateur.",
      loadBlockedFailed: "Impossible de charger la liste des utilisateurs bloqués.",

      // Messages
      loadProfileFailed: "Impossible de charger ton profil.",
      loadSettingsFailed: "Impossible de charger tes paramètres.",
      changesSaved: "Modifications enregistrées.",
      saveFailed: "Impossible d'enregistrer les modifications.",
      avatarUpdated: "Avatar mis à jour.",
      avatarUpdateFailed: "Impossible de mettre à jour l'avatar.",
    },

    // User profile dialog
    profile: {
      title: "Profil",
      description: "Informations visibles selon les réglages de partage.",
      accessDenied: "Accès refusé",
      blockedMessage: "Tu ne peux pas voir ce profil (tu es bloqué).",
      userNotFound: "Utilisateur introuvable.",
      loadFailed: "Impossible de charger ce profil.",
      noInfo: "Aucune information disponible.",
    },

    // Context menu
    contextMenu: {
      viewProfile: "Afficher le profil",
      block: "Bloquer",
      blockConfirmTitle: "Bloquer {username} ?",
      blockConfirmDescription:
        "{username} ne pourra plus te contacter ni voir ton profil selon tes réglages.",
      blocking: "Blocage…",
      blockFailed: "Impossible de bloquer cet utilisateur.",
    },

    // Toasts
    toasts: {
      newFriendRequest: "Nouvelle demande d'ami",
      friendRequestDescription: "{username} vous demande en ami.",
      requestAccepted: "Demande acceptée",
      requestAcceptedDescription: "{username} vous a ajouté en ami.",
    },
  },

  en: {
    // Common
    common: {
      loading: "Loading…",
      error: "Error",
      unknownError: "Unknown error",
      save: "Save",
      saving: "Saving…",
      close: "Close",
      cancel: "Cancel",
      online: "Online",
      offline: "Offline",
      user: "User",
    },

    // Home page
    home: {
      welcome: "Welcome to Sprava",
      description: "A simple, fast and modern messaging app.",
      login: "Log in",
      createAccount: "Create an account",
    },

    // Login page
    login: {
      title: "Login",
      description: "Access your messages.",
      email: "Email address",
      password: "Password",
      submit: "Log in",
      submitting: "Logging in...",
      noAccount: "Don't have an account?",
      createAccount: "Create an account",
      errorCredentials: "Login failed, please check your credentials.",
    },

    // Signup page
    signup: {
      title: "Sign up",
      description: "Create your account to access messaging.",
      email: "Email address",
      username: "Username",
      password: "Password",
      dateOfBirth: "Date of birth",
      submit: "Sign up",
      submitting: "Signing up...",
      hasAccount: "Already have an account?",
      login: "Log in",
    },

    // Chat
    chat: {
      selectConversation: "Select a conversation",
      selectConversationHint:
        "Choose a contact from the left column to get started.",
      noConversation: "No conversations.",
      loadMore: "Scroll up to load more",
      writeMessage: "Write a message…",
      send: "Send",
      removeFile: "Remove",
      addFile: "Add a file",
      copy: "Copy",
      delete: "Delete",
    },

    // Friends
    friends: {
      myFriends: "My friends",
      title: "My friends",
      description:
        "Search for a friend, manage requests, or add someone by username.",
      friendsTab: "Friends",
      requestsTab: "Requests",
      searchPlaceholder: "Search for a username...",
      loadingFriends: "Loading your friends…",
      openConversation: "Open conversation",
      minChars: "Type at least 3 characters.",
      searching: "Searching…",
      noUserFound: "No user found.",
      alreadyFriend: "Already in your friends",
      sendFriendRequest: "Send friend request",
      requestSent: "Friend request sent.",
      requestFailed: "Failed to send the request.",
      openConversationFailed: "Failed to open conversation.",
      noRequests: "No requests.",
      friendRequest: "Friend request",
      accept: "Accept",
      reject: "Reject",
    },

    // User menu
    userMenu: {
      settings: "Settings",
      lightMode: "Light mode",
      darkMode: "Dark mode",
      logout: "Log out",
    },

    // Settings dialog
    settings: {
      title: "Settings",
      subtitle: "Sprava",
      myProfile: "My profile",
      myAccount: "My account",
      security: "Security",
      blockedUsers: "Blocked users",

      // My profile tab
      profileDescription: "Your visible profile (bio, location, website) + avatar.",
      avatar: "Avatar",
      avatarHint: "PNG/JPG, max 5MB.",
      information: "Information",
      bio: "Bio",
      bioPlaceholder: "A few words about you…",
      location: "Location",
      locationPlaceholder: "E.g., Paris",
      website: "Website",
      websitePlaceholder: "https://…",
      sharingSettingsHint:
        'Your sharing settings are in the "Security" tab.',

      // Account tab
      accountDescription: "Identity and account information.",
      account: "Account",
      usernameLabel: "Username",
      emailLabel: "Email",
      dateOfBirthLabel: "Date of birth",
      newPasswordLabel: "New password",
      newPasswordPlaceholder: "Leave empty to keep unchanged",

      // Security tab
      securityDescription: "Control what you share with others.",
      sharingInfo: "Information sharing",
      sharingInfoHint: "Choose who can see your personal information.",
      whoCanSeeLocation: "Who can see your location",
      whoCanSeeEmail: "Who can see your email",
      whoCanSeePhone: "Who can see your phone number",
      whoCanSeeDob: "Who can see your date of birth",
      phone: "Phone",
      everyone: "Everyone",
      friendsOnly: "Friends only",
      nobody: "Nobody",
      securityTip:
        '💡 Tip: "Friends only" allows your friends to see your information. "Everyone" makes it publicly visible.',

      // Blocked tab
      blockedDescription: "Manage blocked users.",
      noBlockedUsers: "No blocked users.",
      blocked: "Blocked",
      unblock: "Unblock",
      userUnblocked: "User unblocked.",
      unblockFailed: "Failed to unblock user.",
      loadBlockedFailed: "Failed to load blocked users list.",

      // Messages
      loadProfileFailed: "Failed to load your profile.",
      loadSettingsFailed: "Failed to load your settings.",
      changesSaved: "Changes saved.",
      saveFailed: "Failed to save changes.",
      avatarUpdated: "Avatar updated.",
      avatarUpdateFailed: "Failed to update avatar.",
    },

    // User profile dialog
    profile: {
      title: "Profile",
      description: "Information visible based on sharing settings.",
      accessDenied: "Access denied",
      blockedMessage: "You cannot view this profile (you are blocked).",
      userNotFound: "User not found.",
      loadFailed: "Failed to load this profile.",
      noInfo: "No information available.",
    },

    // Context menu
    contextMenu: {
      viewProfile: "View profile",
      block: "Block",
      blockConfirmTitle: "Block {username}?",
      blockConfirmDescription:
        "{username} will no longer be able to contact you or view your profile according to your settings.",
      blocking: "Blocking…",
      blockFailed: "Failed to block this user.",
    },

    // Toasts
    toasts: {
      newFriendRequest: "New friend request",
      friendRequestDescription: "{username} wants to be your friend.",
      requestAccepted: "Request accepted",
      requestAcceptedDescription: "{username} added you as a friend.",
    },
  },
} as const;

export type Language = keyof typeof translations;

// Define a type structure that works for all languages
type TranslationStructure = {
  common: {
    loading: string;
    error: string;
    unknownError: string;
    save: string;
    saving: string;
    close: string;
    cancel: string;
    online: string;
    offline: string;
    user: string;
  };
  home: {
    welcome: string;
    description: string;
    login: string;
    createAccount: string;
  };
  login: {
    title: string;
    description: string;
    email: string;
    password: string;
    submit: string;
    submitting: string;
    noAccount: string;
    createAccount: string;
    errorCredentials: string;
  };
  signup: {
    title: string;
    description: string;
    email: string;
    username: string;
    password: string;
    dateOfBirth: string;
    submit: string;
    submitting: string;
    hasAccount: string;
    login: string;
  };
  chat: {
    selectConversation: string;
    selectConversationHint: string;
    noConversation: string;
    loadMore: string;
    writeMessage: string;
    send: string;
    removeFile: string;
    addFile: string;
    copy: string;
    delete: string;
  };
  friends: {
    myFriends: string;
    title: string;
    description: string;
    friendsTab: string;
    requestsTab: string;
    searchPlaceholder: string;
    loadingFriends: string;
    openConversation: string;
    minChars: string;
    searching: string;
    noUserFound: string;
    alreadyFriend: string;
    sendFriendRequest: string;
    requestSent: string;
    requestFailed: string;
    openConversationFailed: string;
    noRequests: string;
    friendRequest: string;
    accept: string;
    reject: string;
  };
  userMenu: {
    settings: string;
    lightMode: string;
    darkMode: string;
    logout: string;
  };
  settings: {
    title: string;
    subtitle: string;
    myProfile: string;
    myAccount: string;
    security: string;
    blockedUsers: string;
    profileDescription: string;
    avatar: string;
    avatarHint: string;
    information: string;
    bio: string;
    bioPlaceholder: string;
    location: string;
    locationPlaceholder: string;
    website: string;
    websitePlaceholder: string;
    sharingSettingsHint: string;
    accountDescription: string;
    account: string;
    usernameLabel: string;
    emailLabel: string;
    dateOfBirthLabel: string;
    newPasswordLabel: string;
    newPasswordPlaceholder: string;
    securityDescription: string;
    sharingInfo: string;
    sharingInfoHint: string;
    whoCanSeeLocation: string;
    whoCanSeeEmail: string;
    whoCanSeePhone: string;
    whoCanSeeDob: string;
    phone: string;
    everyone: string;
    friendsOnly: string;
    nobody: string;
    securityTip: string;
    blockedDescription: string;
    noBlockedUsers: string;
    blocked: string;
    unblock: string;
    userUnblocked: string;
    unblockFailed: string;
    loadBlockedFailed: string;
    loadProfileFailed: string;
    loadSettingsFailed: string;
    changesSaved: string;
    saveFailed: string;
    avatarUpdated: string;
    avatarUpdateFailed: string;
  };
  profile: {
    title: string;
    description: string;
    accessDenied: string;
    blockedMessage: string;
    userNotFound: string;
    loadFailed: string;
    noInfo: string;
  };
  contextMenu: {
    viewProfile: string;
    block: string;
    blockConfirmTitle: string;
    blockConfirmDescription: string;
    blocking: string;
    blockFailed: string;
  };
  toasts: {
    newFriendRequest: string;
    friendRequestDescription: string;
    requestAccepted: string;
    requestAcceptedDescription: string;
  };
};

export type TranslationKeys = TranslationStructure;
