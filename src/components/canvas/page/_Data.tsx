"use client";

type PageType = {
  path: string;
  title: string;
};

class Data {
  static pages: PageType[] = [];
  static pageIndex: number = 0;

  static init({ pages }: { pages: PageType[] }): void {
    this.pages = pages;
    this.pageIndex = 0;
  }

  // Public methods
  static getNext = (page: PageType): PageType => {
    let index = this.pages.indexOf(page);

    if (index === -1 || ++index > this.pages.length - 1) {
      index = 0;
    }

    return this.pages[index];
  };
}

export default Data;
