{pkgs}: {
  deps = [
    pkgs.postgresql
    pkgs.jq
    pkgs.dbus
    pkgs.at-spi2-atk
    pkgs.atk
    pkgs.cups
    pkgs.nss
    pkgs.gtk3
    pkgs.xorg.libXtst
    pkgs.xorg.libXrender
    pkgs.xorg.libXi
    pkgs.xorg.libXfixes
    pkgs.xorg.libXdamage
    pkgs.xorg.libXcursor
    pkgs.xorg.libXcomposite
    pkgs.xorg.libXrandr
    pkgs.xorg.libXext
    pkgs.xorg.libX11
    pkgs.freetype
    pkgs.fontconfig
    pkgs.glib
    pkgs.imagemagick
    pkgs.libwebp
  ];
}
