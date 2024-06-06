interface PageProps {
  path: string;
  title: string;
}

class _ {
  path: string;
  title: string;

  constructor({ path, title }: PageProps) {
    this.path = path;
    this.title = title;

    document.title = `${this.title} — Totem`;
  }
}

export default _;
