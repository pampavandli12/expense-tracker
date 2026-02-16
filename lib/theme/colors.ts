export type AppColors = {
  background: {
    base: string;
    subtle: string;
    surface: string;
    surfaceRaised: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  border: {
    default: string;
    soft: string;
  };
  brand: {
    primary: string;
    primarySoft: string;
  };
  status: {
    income: string;
    incomeSoft: string;
    expense: string;
    expenseSoft: string;
    success: string;
    warning: string;
  };
  icon: {
    muted: string;
  };
  chart: {
    track: string;
    progress: string;
  };
  category: {
    food: {
      icon: string;
      iconBackground: string;
    };
    rent: {
      icon: string;
      iconBackground: string;
    };
    transport: {
      icon: string;
      iconBackground: string;
    };
  };
};

export const lightColors: AppColors = {
  background: {
    base: "#F3F5F4",
    subtle: "#EDF1F5",
    surface: "#FFFFFF",
    surfaceRaised: "#F8FAFC",
  },
  text: {
    primary: "#131E3A",
    secondary: "#667691",
    muted: "#96A4BB",
    inverse: "#FFFFFF",
  },
  border: {
    default: "#E3E8EF",
    soft: "#EEF2F6",
  },
  brand: {
    primary: "#22D95A",
    primarySoft: "#66ED93",
  },
  status: {
    income: "#22D95A",
    incomeSoft: "#CBF5DA",
    expense: "#F85B63",
    expenseSoft: "#FCE3E6",
    success: "#22D95A",
    warning: "#F85B63",
  },
  icon: {
    muted: "#5F6F89",
  },
  chart: {
    track: "#E3E8EF",
    progress: "#22D95A",
  },
  category: {
    food: {
      icon: "#F59F3A",
      iconBackground: "#FCEEDB",
    },
    rent: {
      icon: "#4F8FF6",
      iconBackground: "#DCE9FF",
    },
    transport: {
      icon: "#A160F5",
      iconBackground: "#EEDFFF",
    },
  },
};

export const darkColors: AppColors = {
  background: {
    base: "#0D1523",
    subtle: "#162031",
    surface: "#121C2D",
    surfaceRaised: "#18253A",
  },
  text: {
    primary: "#E8EEFA",
    secondary: "#A1B0C7",
    muted: "#7F92B0",
    inverse: "#06110A",
  },
  border: {
    default: "#24314A",
    soft: "#1D2840",
  },
  brand: {
    primary: "#23DD5D",
    primarySoft: "#4EEF82",
  },
  status: {
    income: "#35E776",
    incomeSoft: "#1D3D2A",
    expense: "#FF7781",
    expenseSoft: "#482630",
    success: "#35E776",
    warning: "#FF7781",
  },
  icon: {
    muted: "#93A6C7",
  },
  chart: {
    track: "#24314A",
    progress: "#23DD5D",
  },
  category: {
    food: {
      icon: "#F7B45D",
      iconBackground: "#3F2E1B",
    },
    rent: {
      icon: "#83B3FF",
      iconBackground: "#1E3355",
    },
    transport: {
      icon: "#C492FF",
      iconBackground: "#332248",
    },
  },
};
