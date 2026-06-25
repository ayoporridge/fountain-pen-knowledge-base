import { expect, type Page, test } from "@playwright/test";

async function expectLibraryPage(
  page: Page,
  path: string,
  expectedTexts: string[],
) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto(path, { waitUntil: "domcontentloaded" });

  for (const text of expectedTexts) {
    await expect(page.getByText(text).first()).toBeVisible();
  }

  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(100);
  expect(errors).toEqual([]);
}

async function getCanvasPixelBounds(page: Page) {
  return page.evaluate(() => {
    const root = document.querySelector('[data-testid="local-graph-canvas"]');
    const canvas = root?.querySelector("canvas");
    if (!root || !canvas) return null;

    const context = canvas.getContext("2d");
    if (!context) return null;

    const { width, height } = canvas;
    const image = context.getImageData(0, 0, width, height).data;
    const background = [247, 245, 240];
    let minX = width;
    let maxX = -1;
    let minY = height;
    let maxY = -1;
    let count = 0;

    for (let y = 0; y < height; y += 2) {
      for (let x = 0; x < width; x += 2) {
        const index = (y * width + x) * 4;
        const diff =
          Math.abs(image[index] - background[0]) +
          Math.abs(image[index + 1] - background[1]) +
          Math.abs(image[index + 2] - background[2]);

        if (image[index + 3] > 30 && diff > 34) {
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
          count++;
        }
      }
    }

    if (count === 0) return null;

    return {
      canvasWidth: width,
      canvasHeight: height,
      minX,
      maxX,
      minY,
      maxY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
      count,
    };
  });
}

test.describe("Library smoke flow", () => {
  test.setTimeout(60_000);

  test("public editing pages and content write APIs are disabled", async ({
    request,
  }) => {
    await expect((await request.get("/new")).status()).toBe(404);
    await expect((await request.get("/brand/pilot/edit")).status()).toBe(404);

    const writeResponses = await Promise.all([
      request.post("/api/entities", {
        data: { type: "brand", slug: "blocked-test", name: "Blocked Test" },
      }),
      request.put("/api/entities/pilot", {
        data: { name: "Pilot" },
      }),
      request.post("/api/tags", {
        data: {
          name: "Blocked Tag",
          slug: "blocked-tag",
          dimension: "test",
          level: "atom",
        },
      }),
      request.post("/api/links", {
        data: { source_id: "a", target_id: "b" },
      }),
      request.post("/api/concepts", {
        data: { name: "Blocked", slug: "blocked", conditions: [] },
      }),
      request.post("/api/admin/reclassify", {
        data: {},
      }),
      request.post("/api/upload", {
        multipart: {
          file: {
            name: "blocked.png",
            mimeType: "image/png",
            buffer: Buffer.from("not really an image"),
          },
        },
      }),
    ]);

    for (const response of writeResponses) {
      expect(response.status()).toBe(403);
      await expect(response.json()).resolves.toMatchObject({
        error: "Content editing is disabled",
      });
    }
  });

  test("library index exposes all major modules", async ({ page }) => {
    await expectLibraryPage(page, "/library", [
      "钢笔图书馆",
      "馆区入口",
      "品牌馆",
      "型号档案",
      "来源索引",
      "媒体授权",
      "图示馆",
      "覆盖审计",
    ]);
  });

  test("library index renders Warm Pen Atlas hero artwork", async ({
    page,
  }) => {
    await page.goto("/library", { waitUntil: "domcontentloaded" });
    const hero = page.getByTestId("library-hero");
    await expect(hero).toBeVisible();
    await expect(hero).toHaveCSS(
      "background-image",
      /warm-pen-atlas\/library-hero\.jpg/,
    );
  });

  test("media index includes the second Warm Pen Atlas batch", async ({
    page,
  }) => {
    await expectLibraryPage(page, "/library/media", [
      "Warm Pen Atlas: Opus 88 品牌馆封面",
      "Warm Pen Atlas: Eversharp 品牌馆封面",
      "Warm Pen Atlas: Noodler's Ink 品牌馆封面",
      "Warm Pen Atlas: TWSBI GO 弹簧活塞封面",
      "Warm Pen Atlas: 文学限量系列封面",
    ]);
  });

  test("media index includes the third Warm Pen Atlas brand batch", async ({
    page,
  }) => {
    await expectLibraryPage(page, "/library/media", [
      "Warm Pen Atlas: Wahl 品牌馆封面",
      "Warm Pen Atlas: Chilton 品牌馆封面",
      "Warm Pen Atlas: Dunn 品牌馆封面",
      "Warm Pen Atlas: Wearever 品牌馆封面",
      "Warm Pen Atlas: WASP 品牌馆封面",
      "Warm Pen Atlas: Monteverde 品牌馆封面",
    ]);
  });

  test("media index includes the fourth Warm Pen Atlas modern China batch", async ({
    page,
  }) => {
    await expectLibraryPage(page, "/library/media", [
      "Warm Pen Atlas: SKB 品牌馆封面",
      "Warm Pen Atlas: PenBBS 品牌馆封面",
      "Warm Pen Atlas: Duke 品牌馆封面",
      "Warm Pen Atlas: KACO 品牌馆封面",
      "Warm Pen Atlas: Snowhite 品牌馆封面",
      "Warm Pen Atlas: Delike 品牌馆封面",
    ]);
  });

  test("media index includes the fifth Warm Pen Atlas Chinese legacy batch", async ({
    page,
  }) => {
    await expectLibraryPage(page, "/library/media", [
      "Warm Pen Atlas: Hero 品牌馆封面",
      "Warm Pen Atlas: HongDian 品牌馆封面",
      "Warm Pen Atlas: Picasso 品牌馆封面",
      "Warm Pen Atlas: Jinhao 品牌馆封面",
      "Warm Pen Atlas: Majohn 品牌馆封面",
      "Warm Pen Atlas: Wing Sung 品牌馆封面",
    ]);
  });

  test("media index includes the sixth Warm Pen Atlas international makers batch", async ({
    page,
  }) => {
    await expectLibraryPage(page, "/library/media", [
      "Warm Pen Atlas: Conklin 品牌馆封面",
      "Warm Pen Atlas: Diplomat 品牌馆封面",
      "Warm Pen Atlas: Esterbrook 品牌馆封面",
      "Warm Pen Atlas: Kaweco 品牌馆封面",
      "Warm Pen Atlas: Leonardo 品牌馆封面",
      "Warm Pen Atlas: Wancher 品牌馆封面",
    ]);
  });

  test("media index includes the seventh Warm Pen Atlas core design brands batch", async ({
    page,
  }) => {
    await expectLibraryPage(page, "/library/media", [
      "Warm Pen Atlas: TWSBI 品牌馆封面",
      "Warm Pen Atlas: Nakaya 品牌馆封面",
      "Warm Pen Atlas: Sailor 品牌馆封面",
      "Warm Pen Atlas: LAMY 品牌馆封面",
      "Warm Pen Atlas: Aurora 品牌馆封面",
      "Warm Pen Atlas: Namiki 品牌馆封面",
    ]);
  });

  test("media index includes the eighth Warm Pen Atlas classic reference brands batch", async ({
    page,
  }) => {
    await expectLibraryPage(page, "/library/media", [
      "Warm Pen Atlas: Schneider 品牌馆封面",
      "Warm Pen Atlas: Platinum 品牌馆封面",
      "Warm Pen Atlas: Pilot 品牌馆封面",
      "Warm Pen Atlas: Visconti 品牌馆封面",
      "Warm Pen Atlas: Cross 品牌馆封面",
      "Warm Pen Atlas: Montblanc 品牌馆封面",
    ]);
  });

  test("media index includes the ninth Warm Pen Atlas reference heritage brands batch", async ({
    page,
  }) => {
    await expectLibraryPage(page, "/library/media", [
      "Warm Pen Atlas: Waterman 品牌馆封面",
      "Warm Pen Atlas: M&G 品牌馆封面",
      "Warm Pen Atlas: Parker 品牌馆封面",
      "Warm Pen Atlas: Sheaffer 品牌馆封面",
      "Warm Pen Atlas: Pelikan 品牌馆封面",
      "Warm Pen Atlas: Faber-Castell 品牌馆封面",
    ]);
  });

  test("media index includes the tenth Warm Pen Atlas research gap brands batch", async ({
    page,
  }) => {
    await expectLibraryPage(page, "/library/media", [
      "Warm Pen Atlas: Admok 品牌馆封面",
      "Warm Pen Atlas: Tramol 品牌馆封面",
      "Warm Pen Atlas: Shanghai 品牌馆封面",
      "Warm Pen Atlas: DongWu 品牌馆封面",
      "Warm Pen Atlas: ShuLe 品牌馆封面",
    ]);
  });

  test("media index includes the eleventh Warm Pen Atlas research gap brands batch", async ({
    page,
  }) => {
    await expectLibraryPage(page, "/library/media", [
      "Warm Pen Atlas: YiRen 品牌馆封面",
      "Warm Pen Atlas: BanJu 品牌馆封面",
      "Warm Pen Atlas: TangYue 品牌馆封面",
      "Warm Pen Atlas: Saier 品牌馆封面",
      "Warm Pen Atlas: Dagong 品牌馆封面",
    ]);
  });

  test("media index includes the twelfth Warm Pen Atlas research gap brands batch", async ({
    page,
  }) => {
    await expectLibraryPage(page, "/library/media", [
      "Warm Pen Atlas: YiSiHua 品牌馆封面",
      "Warm Pen Atlas: Campus 品牌馆封面",
      "Warm Pen Atlas: YongXu 品牌馆封面",
      "Warm Pen Atlas: Paili 品牌馆封面",
      "Warm Pen Atlas: Lanbitou 品牌馆封面",
    ]);
  });

  test("under-documented brand pages reuse existing fallback artwork", async ({
    page,
  }) => {
    await page.goto("/brand/hero-paddy", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("英雄派迪 (Hero Paddy)").first()).toBeVisible();
    await expect(
      page.getByRole("img", { name: "英雄派迪 (Hero Paddy)" }),
    ).toHaveAttribute("src", /brand-museum-cover\.jpg/);
    await expect(page.getByText("英雄派迪先处理命名和从属关系")).toBeVisible();
    await expect(page.getByText("命名边界还不稳")).toBeVisible();
  });

  test("research-gap pages show sourced draft stories and review status", async ({
    page,
  }) => {
    await page.goto("/brand/douwan", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("逗万 (DouWan)").first()).toBeVisible();
    await expect(page.getByText("先把逗万放进现代文创钢笔语境")).toBeVisible();
    await expect(
      page.getByText("逗万 DareWorks: 品牌概述").first(),
    ).toBeVisible();

    await page.goto("/pen/逗万-流光系列", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("逗万 流光系列").first()).toBeVisible();
    await expect(
      page.getByText("把流光系列先做成可核验的现代产品档案"),
    ).toBeVisible();
    await expect(page.getByText("铱金 F 尖（官方产品文章口径）")).toBeVisible();
  });

  test("remaining low-source brands render research queue copy", async ({
    page,
  }) => {
    await page.goto("/brand/lanbitou", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("烂笔头 (Lanbitou)").first()).toBeVisible();
    await expect(page.getByText("烂笔头先进入资料补证队列")).toBeVisible();
    await expect(
      page.getByText("Research index: 烂笔头 Lanbitou 3059").first(),
    ).toBeVisible();

    await page.goto("/pen/烂笔头-lanbitou-3059", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByText("烂笔头 Lanbitou 3059").first()).toBeVisible();
    await expect(page.getByText("3059先作为待核验型号保留")).toBeVisible();
    await expect(page.getByText("墨囊/上墨器口径待核验")).toBeVisible();
  });

  test("priority model gap pages render research-queue archives", async ({
    page,
  }) => {
    await page.goto(`/pen/${encodeURIComponent("kaco-master大师14k")}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByText("KACO Master大师14K").first()).toBeVisible();
    await expect(
      page.getByText("把 Master大师14K 先放进金尖入门研究队列"),
    ).toBeVisible();
    await expect(
      page.getByText("Research index: KACO Master大师14K").first(),
    ).toBeVisible();
    await expect(page.getByText("14K 金尖说法待核验")).toBeVisible();

    await page.goto(`/pen/${encodeURIComponent("noodler鲶鱼-简易钢笔")}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByText("Noodler鲶鱼 简易钢笔").first()).toBeVisible();
    await expect(
      page.getByText("先解决 Noodler's 简易钢笔的型号身份"),
    ).toBeVisible();
    await expect(
      page.getByText("Noodler's Ink official site").first(),
    ).toBeVisible();

    await page.goto(
      `/pen/${encodeURIComponent("中屋-nakaya-portable-writer-黑溜涂")}`,
      { waitUntil: "domcontentloaded" },
    );
    await expect(
      page.getByText("中屋 Nakaya Portable Writer 黑溜涂").first(),
    ).toBeVisible();
    await expect(
      page.getByText("把 Portable Writer 黑溜涂拆成笔形与漆面两层"),
    ).toBeVisible();
    await expect(page.getByText("Nakaya: Models").first()).toBeVisible();

    await page.goto(`/pen/${encodeURIComponent("万宝龙-montblanc-学生龙22")}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByText("把 Montblanc 22 先作为 vintage 入门研究页"),
    ).toBeVisible();
    await expect(
      page.getByText("Research index: Montblanc 22 vintage").first(),
    ).toBeVisible();

    await page.goto(`/pen/${encodeURIComponent("写乐-sailor-0501铱金")}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByText("把 Sailor 0501 铱金从玩家评价里拆出来"),
    ).toBeVisible();
    await expect(page.getByText("铱金/钢尖说法待核验")).toBeVisible();
  });

  test("second priority model gap pages render official anchors and boundaries", async ({
    page,
  }) => {
    await page.goto(
      `/pen/${encodeURIComponent("写乐-sailor-1911-profit系列")}`,
      {
        waitUntil: "domcontentloaded",
      },
    );
    await expect(
      page.getByText("把 1911 / Profit 作为写乐雪茄形主线来读"),
    ).toBeVisible();
    await expect(page.getByText("21K / 14K 金尖").first()).toBeVisible();
    await expect(page.getByText("Sailor: 1911 Series").first()).toBeVisible();

    await page.goto(
      `/pen/${encodeURIComponent("写乐-sailor-21k-pro-gear-大鱼雷")}`,
      { waitUntil: "domcontentloaded" },
    );
    await expect(
      page.getByText("先拆清 21K Pro Gear 与 1521 标准鱼雷"),
    ).toBeVisible();
    await expect(page.getByText("型号身份待拆分")).toBeVisible();
    await expect(
      page.getByText("Sailor: Professional Gear Series").first(),
    ).toBeVisible();

    await page.goto(`/pen/${encodeURIComponent("写乐-sailor-长刀研")}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByText("把长刀研先标成笔尖研磨而非单支型号"),
    ).toBeVisible();
    await expect(page.getByText("可能应重分类为笔尖/书写特性")).toBeVisible();
    await expect(
      page.getByText("Sailor: Naginata Togi special nib").first(),
    ).toBeVisible();

    await page.goto(`/pen/${encodeURIComponent("凌美-lamy-al-star-恒星")}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByText("把 AL-star 恒星放进 Safari 之后的金属入口线"),
    ).toBeVisible();
    await expect(page.getByText("铝制笔身").first()).toBeVisible();
    await expect(
      page.getByText("LAMY: AL-star fountain pen").first(),
    ).toBeVisible();

    await page.goto(`/pen/${encodeURIComponent("凌美-lamy-dialog-3-焦点3")}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByText("把 Dialog 3 焦点3放进伸缩钢笔机制线"),
    ).toBeVisible();
    await expect(page.getByText("伸缩笔尖").first()).toBeVisible();
    await expect(
      page.getByText("LAMY: dialog fountain pen").first(),
    ).toBeVisible();

    await page.goto(`/pen/${encodeURIComponent("凌美-lamy-logo")}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByText("先把 LAMY logo 留在目录补证队列"),
    ).toBeVisible();
    await expect(
      page.getByText("Research index: LAMY logo fountain pen").first(),
    ).toBeVisible();
  });

  test("third priority model gap pages render research archives", async ({
    page,
  }) => {
    await page.goto(`/pen/${encodeURIComponent("凌美-lamy-studio-演艺")}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByText("把 LAMY studio 演艺放进设计款日用笔队列"),
    ).toBeVisible();
    await expect(
      page.getByText("LAMY: studio fountain pen").first(),
    ).toBeVisible();

    await page.goto(`/pen/${encodeURIComponent("坛笔-penbbs-456")}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByText("先核验 PenBBS 456 的上墨系统")).toBeVisible();
    await expect(page.getByText("活塞/真空上墨说法待核验")).toBeVisible();
    await expect(
      page.getByText("Research index: PenBBS 456").first(),
    ).toBeVisible();

    await page.goto(
      `/pen/${encodeURIComponent("威迪文-waterman-查尔斯顿-hemisphere")}`,
      { waitUntil: "domcontentloaded" },
    );
    await expect(
      page.getByText("先拆清 Charleston 与 Hemisphere 的混合命名"),
    ).toBeVisible();
    await expect(
      page.getByText("Charleston / Hemisphere 身份待拆分"),
    ).toBeVisible();
    await expect(
      page
        .getByText("Research index: Waterman Hemisphere / Charleston")
        .first(),
    ).toBeVisible();

    await page.goto(`/pen/${encodeURIComponent("并木-namiki-飞升龙")}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByText("先确认飞升龙是作品名、主题还是系列条目"),
    ).toBeVisible();
    await expect(
      page.getByText("Research index: Namiki Flying Dragon / 飞升龙").first(),
    ).toBeVisible();

    await page.goto(`/pen/${encodeURIComponent("弘典-hongdian-516")}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByText("把 HongDian 516 先放进超低价型号补证队列"),
    ).toBeVisible();
    await expect(page.getByText("20-40 说法待核验")).toBeVisible();
    await expect(
      page.getByText("Research index: HongDian 516").first(),
    ).toBeVisible();
  });

  test("fourth priority model gap pages render research archives", async ({
    page,
  }) => {
    await page.goto(`/pen/${encodeURIComponent("弘典-hongdian-n6云章")}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByText("把 N6 云章先从强口碑里拆出证据问题"),
    ).toBeVisible();
    await expect(page.getByText("200 以内说法待核验")).toBeVisible();
    await expect(
      page.getByText("Research index: HongDian N6 云章").first(),
    ).toBeVisible();

    await page.goto(`/pen/${encodeURIComponent("弘典-hongdian-t1钛合金")}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByText("把 T1 钛合金先做成材质和手感核验页"),
    ).toBeVisible();
    await expect(page.getByText("钛合金/金属材质说法待核验")).toBeVisible();
    await expect(
      page.getByText("Research index: HongDian T1 钛合金").first(),
    ).toBeVisible();

    await page.goto(
      `/pen/${encodeURIComponent("弘典-hongdian-黑森林-黑森林pro")}`,
      { waitUntil: "domcontentloaded" },
    );
    await expect(
      page.getByText("先拆清黑森林、黑森林 Pro 和 1861 的边界"),
    ).toBeVisible();
    await expect(page.getByText("黑森林 / 黑森林 Pro / 1861")).toBeVisible();
    await expect(
      page
        .getByText("Research index: HongDian Black Forest / Black Forest Pro")
        .first(),
    ).toBeVisible();

    await page.goto(`/pen/${encodeURIComponent("得力克-delike-元素系列")}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByText("把 Delike 元素系列先放进低资料系列补证队列"),
    ).toBeVisible();
    await expect(
      page.getByText("Research index: Delike Element / 元素系列").first(),
    ).toBeVisible();

    await page.goto(`/pen/${encodeURIComponent("文采-kaco-edge刀锋")}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByText("把 KACO Edge 刀锋先做成设计型号补证页"),
    ).toBeVisible();
    await expect(
      page.getByText("Research index: KACO Edge / 刀锋").first(),
    ).toBeVisible();
  });

  test("fifth priority model gap pages render research archives", async ({
    page,
  }) => {
    await page.goto(`/pen/${encodeURIComponent("晨光-按动钢笔")}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByText("把晨光按动钢笔先和 Capless 体验装说法分开"),
    ).toBeVisible();
    await expect(page.getByText("按动/墨囊结构待核验")).toBeVisible();
    await expect(
      page.getByText("Research index: M&G / 晨光 按动钢笔").first(),
    ).toBeVisible();

    await page.goto(`/pen/${encodeURIComponent("末匠-majohn-a1-按动")}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByText("把 Majohn A1 的按动机制和 Capless 对比分开写"),
    ).toBeVisible();
    await expect(page.getByText("百元价位说法待核验")).toBeVisible();
    await expect(
      page.getByText("Research index: Majohn A1 retractable").first(),
    ).toBeVisible();

    await page.goto(`/pen/${encodeURIComponent("末匠-majohn-v1-负压上墨")}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByText("把 V1 负压上墨先放进机制核验队列"),
    ).toBeVisible();
    await expect(page.getByText("负压/真空上墨说法待核验")).toBeVisible();
    await expect(
      page.getByText("Research index: Majohn V1 vacuum filler").first(),
    ).toBeVisible();

    await page.goto(`/pen/${encodeURIComponent("末匠-majohn-v60")}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByText("把 V60 的代餐说法先降级成待归因评论"),
    ).toBeVisible();
    await expect(
      page.getByText("Research index: Majohn V60").first(),
    ).toBeVisible();

    await page.goto(`/pen/${encodeURIComponent("毕加索-picasso-916")}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByText("把 Picasso 916 先放进入门国产型号补证队列"),
    ).toBeVisible();
    await expect(
      page.getByText("Research index: Picasso 916").first(),
    ).toBeVisible();
  });

  test("sixth priority model gap pages render Wing Sung and Parker archives", async ({
    page,
  }) => {
    await page.goto(`/pen/${encodeURIComponent("永生-wingsung-3013")}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByText("把 3013 的低价负压体验拆成机制核验页"),
    ).toBeVisible();
    await expect(
      page.getByText("Research index: Wing Sung 3013 vacuum filler").first(),
    ).toBeVisible();

    await page.goto(`/pen/${encodeURIComponent("永生-wingsung-601")}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByText("把 601 放进新永生复兴的核心型号队列"),
    ).toBeVisible();
    await expect(
      page.getByText("Research index: Wing Sung 601").first(),
    ).toBeVisible();

    await page.goto(`/pen/${encodeURIComponent("永生-wingsung-698")}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByText("把 698 的金尖活塞说法拆成版本核验"),
    ).toBeVisible();
    await expect(page.getByText("金尖/钢尖版本说法待核验")).toBeVisible();

    await page.goto(`/pen/${encodeURIComponent("永生-wingsung-729")}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByText("先确认 729 是永生型号还是误并条目"),
    ).toBeVisible();
    await expect(
      page.getByText("Research index: Wing Sung 729").first(),
    ).toBeVisible();

    await page.goto(`/pen/${encodeURIComponent("派克-parker-51复刻")}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByText("把 Parker 51 复刻和 vintage 51 分开读"),
    ).toBeVisible();
    await expect(
      page.getByText("Research index: Parker 51 modern reissue").first(),
    ).toBeVisible();

    await page.goto(`/pen/${encodeURIComponent("派克-parker-im丽雅")}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByText("把 Parker IM 丽雅做成商务日用入口"),
    ).toBeVisible();
    await expect(
      page.getByText("Research index: Parker IM fountain pen").first(),
    ).toBeVisible();
  });

  test("seventh priority model gap pages render Parker Sheaffer and Platinum archives", async ({
    page,
  }) => {
    await page.goto(`/pen/${encodeURIComponent("派克-parker-世纪-duofold")}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByText("把 Parker Duofold 的百年名号和现代产品拆开"),
    ).toBeVisible();
    await expect(
      page.getByText("Research index: Parker Duofold modern").first(),
    ).toBeVisible();

    await page.goto(`/pen/${encodeURIComponent("派克-parker-卓尔-sonnet")}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByText("把 Sonnet 卓尔的商务外观和书写争议分开写"),
    ).toBeVisible();
    await expect(
      page.getByText("Research index: Parker Sonnet fountain pen").first(),
    ).toBeVisible();

    await page.goto(`/pen/${encodeURIComponent("犀飞利-sheaffer-品牌泛称")}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByText("先把 Sheaffer 品牌泛称标成待重分类条目"),
    ).toBeVisible();
    await expect(
      page.getByText("待重分类 / brand-generic entry"),
    ).toBeVisible();

    await page.goto(`/pen/${encodeURIComponent("白金-platinum-curidas")}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByText("把 Curidas 放进按动钢笔机制核验队列"),
    ).toBeVisible();
    await expect(
      page.getByText("Research index: Platinum Curidas").first(),
    ).toBeVisible();

    await page.goto(`/pen/${encodeURIComponent("白金-platinum-小流星pq200")}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByText("先确认小流星 PQ200 和 Preppy 的对应关系"),
    ).toBeVisible();
    await expect(page.getByText("30-60 说法待核验")).toBeVisible();

    await page.goto(`/pen/${encodeURIComponent("白金-platinum-莳绘系列")}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByText("把白金莳绘系列先标成系列页而非单支型号"),
    ).toBeVisible();
    await expect(
      page.getByText("Research index: Platinum Maki-e series").first(),
    ).toBeVisible();
  });

  test("mismatched entity type routes redirect to canonical page", async ({
    page,
  }) => {
    await page.goto("/pen/i-moore-evans-who-were-they", {
      waitUntil: "domcontentloaded",
    });

    await page.waitForURL(/\/article\/i-moore-evans-who-were-they$/, {
      timeout: 15_000,
    });
    await expect(page.getByText("I: Moore & Evans").first()).toBeVisible();
  });

  const supportPages: Array<[string, string[]]> = [
    ["/library/sources", ["来源索引", "来源登记", "已登记参考资料"]],
    [
      "/library/media",
      ["媒体授权", "媒体候选池", "待补授权", "Warm Pen Atlas: 图书馆入口封面"],
    ],
    ["/library/community", ["玩家口碑", "只存元数据", "事实需二次核验"]],
    [
      "/library/diagrams",
      ["图示馆", "真空上墨机制", "笔尖与笔舌解剖图", "引用"],
    ],
    ["/library/coverage", ["馆藏覆盖", "品牌覆盖", "型号覆盖", "优先补全"]],
    ["/exhibits", ["历史展览", "日系三金", "中国钢笔记忆"]],
    ["/timeline", ["历史时间线", "品牌早期历史节点"]],
  ];

  for (const [path, texts] of supportPages) {
    test(`support page renders: ${path}`, async ({ page }) => {
      await expectLibraryPage(page, path, texts);
    });
  }

  test("source index filters by source and source type", async ({ page }) => {
    await expectLibraryPage(page, "/library/sources?source=richardspens", [
      "当前筛选：Richard's Pens",
      "Richard's Pens · 309",
      "profile_article",
      "copyrighted; summary/link only",
    ]);

    await expectLibraryPage(page, "/library/sources?type=blog", [
      "当前筛选：博客/资料站",
      "Richard's Pens",
      "PenHero",
    ]);
  });

  test("brand museum shows identifiers, claims, timeline, models, and sources", async ({
    page,
  }) => {
    await expectLibraryPage(page, "/brand/pilot", [
      "品牌馆",
      "外部标识与别名",
      "Q1356034",
      "事实与证据",
      "Pilot official history positions 1918",
      "引用",
      "品牌时间线",
      "代表型号",
      "来源卡片",
    ]);
  });

  test("newly bootstrapped brand pages show Wikidata source cards", async ({
    page,
  }) => {
    await expectLibraryPage(page, "/brand/montblanc", [
      "品牌馆",
      "外部标识与别名",
      "Q142691",
      "事实与证据",
      "Wikidata 描述",
      "来源卡片",
      "Wikidata",
      "wikidata_item",
      "CC0",
    ]);
  });

  test("classic reference brand stories render with official source anchors", async ({
    page,
  }) => {
    await expectLibraryPage(page, "/brand/montblanc", [
      "从 Meisterstück 读万宝龙",
      "1906 年官方源流",
      "Montblanc: About Montblanc",
    ]);

    await expectLibraryPage(page, "/brand/waterman", [
      "从可靠供墨读 Waterman",
      "Three Fissure Feed",
      "Waterman: Heritage",
    ]);

    await expectLibraryPage(page, "/brand/parker", [
      "从 Lucky Curve 到 Parker 51",
      "George Safford Parker",
      "Parker: The History of Parker",
    ]);

    await expectLibraryPage(page, "/brand/pelikan", [
      "从 1929 年第一支 Pelikan 钢笔读百利金",
      "green marbled band",
      "Pelikan: Our History",
    ]);
  });

  test("brand identifier completion renders aliases and external ids", async ({
    page,
  }) => {
    await expectLibraryPage(page, "/brand/hero", [
      "外部标识与别名",
      "hero.com.cn",
      "Shanghai Hero",
    ]);

    await expectLibraryPage(page, "/brand/kaweco", [
      "外部标识与别名",
      "kaweco-pen.com",
      "Kaweco Sport",
    ]);

    await expectLibraryPage(page, "/brand/noodlers", [
      "外部标识与别名",
      "noodlersink.com",
      "Noodler's Ink",
    ]);

    await expectLibraryPage(page, "/brand/wingsung", [
      "外部标识与别名",
      "frankunderwater-new-wing-sungs",
      "New Wing Sung",
    ]);
  });

  test("official brand sources show history anchors and timelines", async ({
    page,
  }) => {
    await expectLibraryPage(page, "/brand/sailor", [
      "外部标识与别名",
      "事实与证据",
      "官方历史线索",
      "Sakata-Manufactory",
      "从金笔尖作坊进入日本笔尖谱系",
      "品牌时间线",
      "Sakata-Manufactory founded",
      "来源卡片",
      "Sailor official site",
      "Sailor: Our History",
    ]);
  });

  test("expanded brand stories render for Platinum and Kaweco", async ({
    page,
  }) => {
    await expectLibraryPage(page, "/brand/platinum", [
      "把 #3776 主线放进日本钢笔馆",
      "日本钢笔制造商",
      "Platinum Pen: Company",
    ]);

    await expectLibraryPage(page, "/brand/kaweco", [
      "从 Sport 口袋笔进入 Kaweco",
      "Sport 口袋笔",
      "Kaweco official site",
    ]);
  });

  test("expanded official brand stories render for historic and modern brands", async ({
    page,
  }) => {
    await expectLibraryPage(page, "/brand/diplomat", [
      "把德国精密书写放进 Diplomat 品牌馆",
      "1922 年 3 月",
      "DIPLOMAT: Our History",
    ]);

    await expectLibraryPage(page, "/brand/esterbrook", [
      "从 Camden 的钢笔工业到现代 Estie",
      "1858 年",
      "Esterbrook: Brand History",
    ]);

    await expectLibraryPage(page, "/brand/conklin", [
      "从 Crescent Filler 读 Conklin",
      "Roy Conklin",
      "Conklin: About Us",
    ]);

    await expectLibraryPage(page, "/brand/leonardo", [
      "现代意大利家族工坊的一条线索",
      "50 年以上钢笔经验",
      "Leonardo Officina Italiana official site",
    ]);
  });

  test("expanded maker-positioning brand stories render for modern Japanese and Taiwanese brands", async ({
    page,
  }) => {
    await expectLibraryPage(page, "/brand/twsbi", [
      "从 OEM 经验读 TWSBI 的透明活塞笔",
      "San Wen Tong",
      "TWSBI: About Us",
    ]);

    await expectLibraryPage(page, "/brand/nakaya", [
      "把手工定制和白金工艺背景放进 Nakaya",
      "Platinum Pen 制造工厂经验",
      "Nakaya: About Us",
    ]);

    await expectLibraryPage(page, "/brand/wancher", [
      "现代日系材质实验的一条入口",
      "premium Japanese fountain pen",
      "Wancher official site",
    ]);

    await expectLibraryPage(page, "/brand/namiki", [
      "从 Maki-e 豪华钢笔读 Namiki",
      "luxury Maki-e fountain pen",
      "Namiki official site",
    ]);
  });

  test("expanded brand stories render for previously empty historical and community brands", async ({
    page,
  }) => {
    await expectLibraryPage(page, "/brand/opus88", [
      "把台湾滴入式钢笔放进现代馆",
      "2017 年后聚焦 eyedropper fountain pens",
      "Spotlight: OPUS 88",
    ]);

    await expectLibraryPage(page, "/brand/eversharp", [
      "从自动铅笔和 Skyline 进入 Eversharp",
      "Henry Dreyfuss",
      "PenHero: Eversharp Skyline",
    ]);

    await expectLibraryPage(page, "/brand/moore", [
      "把 Moore 放回 Boston 安全笔和二线老牌脉络",
      "American Fountain Pen Company",
      "PenHero: Moore Fingertip",
    ]);

    await expectLibraryPage(page, "/brand/noodlers", [
      "先把 Noodler's 当作墨水品牌来读",
      "100% made in the USA",
      "Truly American Made: Noodler's Ink",
    ]);
  });

  test("expanded Richard's Pens brand stories render for vintage gap brands", async ({
    page,
  }) => {
    await expectLibraryPage(page, "/brand/wahl", [
      "从 Wahl Pen 读 Eversharp 之前的机械脉络",
      "roller clip",
      "The Wahl Pen",
    ]);

    await expectLibraryPage(page, "/brand/chilton", [
      "把 Chilton 放进 pneumatic filler 的路线",
      "second-generation pneumatic filling system",
      "The Chilton Chiltonian",
    ]);

    await expectLibraryPage(page, "/brand/dunn", [
      "从 Little Red Pump-Handle 读 Dunn-Pen",
      "Dunn-Pen Company",
      "high-capacity pump filler",
      "The Dunn-Pen",
    ]);

    await expectLibraryPage(page, "/brand/wearever", [
      "把 Wearever 放进大众化材料和注塑工艺语境",
      "David Kahn",
      "The Wearever Zenith",
    ]);
  });

  test("expanded brand stories render for remaining sourced gap brands", async ({
    page,
  }) => {
    await expectLibraryPage(page, "/brand/graphomatic", [
      "从战时 ink-making pen 读 Graphomatic",
      "Graph-O-Matic",
      "The Graphomatic Inkmaker & Colonel",
    ]);

    await expectLibraryPage(page, "/brand/ingersoll", [
      "把 Ingersoll 的 dollar concept 放进钢笔馆",
      "Charles H. Ingersoll Dollar Pen Company",
      "The Ingersoll Dollar Pen",
    ]);

    await expectLibraryPage(page, "/brand/morrison", [
      "从 Patriot 读 Morrison 的战时钢笔",
      "World War II",
      "Morrison’s Patriot",
    ]);

    await expectLibraryPage(page, "/brand/wasp", [
      "把 WASP 当作 Sheaffer 低价线索来读",
      "W. A. Sheaffer Pen Company",
      "The WASP Addipoint",
    ]);

    await expectLibraryPage(page, "/brand/monteverde", [
      "把 Monteverde 放进现代 Yafa 品牌和色彩文具体系",
      "Founded in 1999",
      "Monteverde USA: About Monteverde",
    ]);
  });

  test("expanded brand stories render for sourced Chinese and Taiwan brands", async ({
    page,
  }) => {
    await expectLibraryPage(page, "/brand/skb", [
      "把 SKB 放回台湾书写记忆和重启钢笔生产线",
      "1955 年",
      "SKB文明鋼筆：關於我們",
    ]);

    await expectLibraryPage(page, "/brand/penbbs", [
      "把 PenBBS 当作社区驱动的现代钢笔品牌来读",
      "Chinese Internet forum",
      "The Gentleman Stationer: PenBBS",
    ]);

    await expectLibraryPage(page, "/brand/duke", [
      "把 Duke 放进中国出口钢笔和制造商目录语境",
      "Shanghai G. Crown Fountain Pen Co., Ltd.",
      "GoldSupplier: Shanghai G. Crown Fountain Pen Co., Ltd.",
    ]);
  });

  test("expanded brand stories render for modern Chinese stationery brands", async ({
    page,
  }) => {
    await expectLibraryPage(page, "/brand/kaco", [
      "把 KACO 放进上海原创设计文具品牌语境",
      "2011 年",
      "KACO：品牌介绍",
    ]);

    await expectLibraryPage(page, "/brand/snowhite", [
      "把白雪放进中国直液式书写工具和 OEM 文具工业",
      "May 1988",
      "Snowhite Pen: About Us",
    ]);

    await expectLibraryPage(page, "/brand/delike", [
      "把 Delike 放进口袋平价笔和 New Moon 评测语境",
      "New Moon 3",
      "Fountain Pen Chronicles: Delike New Moon 3",
    ]);
  });

  test("expanded brand stories render for Chinese value and revival brands", async ({
    page,
  }) => {
    await expectLibraryPage(page, "/brand/jinhao", [
      "把 Jinhao 放进上海千古和入门钢笔生态",
      "Shanghai Qiangu Stationery Co., Ltd.",
      "Alibaba: Shanghai Qiangu Stationery Co., Ltd.",
    ]);

    await expectLibraryPage(page, "/brand/majohn", [
      "把 Majohn 放进 Moonman 改名和现代平价机制实验",
      "Moonman",
      "Sketchy Wolf: Majohn/Moonman A1",
    ]);

    await expectLibraryPage(page, "/brand/wingsung", [
      "把 Wing Sung 放进新永生复兴和 601 语境",
      "New Wing Sung",
      "FrankUnderwater: The New Wing Sungs Explained",
    ]);
  });

  test("expanded brand stories render for Chinese legacy and gift-pen brands", async ({
    page,
  }) => {
    await expectLibraryPage(page, "/brand/hero", [
      "把 Hero 放回华孚金笔厂、英雄金笔厂和国货钢笔记忆",
      "1931 年",
      "上海英雄（集团）：集团概况",
    ]);

    await expectLibraryPage(page, "/brand/hongdian", [
      "把 HongDian 放进 Black Forest 和现代金属日用笔语境",
      "Dark Blue Forest",
      "dapprman: Hong Dian Dark Blue Forest",
    ]);

    await expectLibraryPage(page, "/brand/picasso", [
      "把 Picasso 放进上海帕弗洛和艺术钢笔礼品语境",
      "上海帕弗洛文化用品有限公司成立于2003年",
      "毕加索钢笔官方网站：公司简介",
    ]);
  });

  test("model archive shows claims, variants, diagrams, and sources", async ({
    page,
  }) => {
    await expectLibraryPage(page, "/pen/pilot-custom-823", [
      "型号档案",
      "事实与证据",
      "CUSTOM series material lists Custom 823",
      "引用",
      "版本与变体",
      "真空上墨机制",
      "来源卡片",
    ]);
  });

  test("official model archives show specs, stories, variants, and sources", async ({
    page,
  }) => {
    await expectLibraryPage(page, "/pen/sailor-pro-gear", [
      "型号档案",
      "Professional Gear",
      "21K 或 14K",
      "把平顶外形和写乐笔尖反馈放在一起看",
      "版本与变体",
      "King Professional Gear",
      "Sailor Pro Gear 系列关系示意",
      "来源卡片",
      "Sailor official site",
    ]);
  });

  test("expanded official model archives render for pocket, school, and entry pens", async ({
    page,
  }) => {
    const cases = [
      {
        path: "/pen/kaweco-al-sport",
        texts: [
          "型号档案",
          "AL Sport",
          "把 Sport 的口袋比例换成金属触感",
          "铝合金笔身",
          "Kaweco: AL Sport",
        ],
      },
      {
        path: "/pen/kaweco-liliput",
        texts: [
          "型号档案",
          "LILIPUT",
          "极小笔身里的 Kaweco 老型号语境",
          "1908 语境",
          "Kaweco: LILIPUT",
        ],
      },
      {
        path: "/pen/kaweco-student",
        texts: [
          "型号档案",
          "STUDENT",
          "从学生用品叙事读 Kaweco 的复古日用笔",
          "1883 学生用品语境",
          "Kaweco: STUDENT",
        ],
      },
      {
        path: "/pen/%E5%87%8C%E7%BE%8E-lamy-safari-%E7%8B%A9%E7%8C%8E%E8%80%85",
        texts: [
          "型号档案",
          "safari",
          "设计课、校用笔和现代钢笔入口",
          "T10 墨囊",
          "LAMY: safari fountain pen",
        ],
      },
      {
        path: "/pen/%E4%B8%89%E6%96%87%E5%A0%82-twsbi-eco",
        texts: [
          "型号档案",
          "ECO",
          "把活塞上墨带进入门透明示范笔",
          "活塞上墨",
          "TWSBI: ECO Black Fountain Pen",
        ],
      },
    ];

    for (const item of cases) {
      await expectLibraryPage(page, item.path, item.texts);
    }
  });

  test("expanded official model archives render for craft and filling-system lines", async ({
    page,
  }) => {
    const cases = [
      {
        path: "/pen/%E4%B8%89%E6%96%87%E5%A0%82-twsbi-580-580al",
        texts: [
          "型号档案",
          "Diamond 580 / 580AL",
          "把可拆维护和活塞示范笔放在一起读",
          "活塞上墨",
          "TWSBI: Diamond 580 Clear Fountain Pen",
        ],
      },
      {
        path: "/pen/%E4%B8%89%E6%96%87%E5%A0%82-twsbi-vac700r",
        texts: [
          "型号档案",
          "VAC700R",
          "从活塞示范笔走向真空上墨的大容量路线",
          "真空上墨",
          "TWSBI: Vac700R Iris Fountain Pen",
        ],
      },
      {
        path: "/pen/wancher%E4%B8%87%E4%BD%B3-dream-pen",
        texts: [
          "型号档案",
          "Dream Pen",
          "把材质实验和日本传统工艺放进同一条型号线",
          "日本 ebonite",
          "Wancher: Dream Pen Collection",
        ],
      },
      {
        path: "/pen/%E5%B9%B6%E6%9C%A8-namiki-emperor",
        texts: [
          "型号档案",
          "Emperor",
          "把 Emperor 当作 Namiki 顶级莳绘入口来读",
          "No.50",
          "Namiki: Emperor Collection",
        ],
      },
      {
        path: "/pen/%E5%B9%B6%E6%9C%A8-namiki-yukari-royale%E7%9A%87%E5%AE%B6%E7%BC%98",
        texts: [
          "型号档案",
          "Yukari Royale",
          "从“缘”的名字理解优雅题材的莳绘系列",
          "Urushi/Maki-e",
          "Namiki: Yukari Royale Collection",
        ],
      },
    ];

    for (const item of cases) {
      await expectLibraryPage(page, item.path, item.texts);
    }
  });

  test("expanded official model archives render for modern international lines", async ({
    page,
  }) => {
    const cases = [
      {
        path: "/pen/diplomat%E8%BF%AA%E6%B3%A2%E6%9B%BC-aero%E5%A4%AA%E7%A9%BA%E6%A2%AD",
        texts: [
          "型号档案",
          "Aero",
          "把 Zeppelin 流线和金属笔身放在一起读",
          "铝制笔身",
          "DIPLOMAT: Aero",
        ],
      },
      {
        path: "/pen/esterbrook-estie-oversized",
        texts: [
          "型号档案",
          "Estie Oversized",
          "把 vintage 名字和现代加大日用笔分开读",
          "Oversized",
          "Esterbrook: Estie Oversized",
        ],
      },
      {
        path: "/pen/leonardo-furore-momento-magico",
        texts: [
          "型号档案",
          "Furore / Momento Magico",
          "把意大利树脂和上墨路线拆成两条线",
          "活塞上墨",
          "Leonardo: Momento Magico",
        ],
      },
      {
        path: "/pen/opus-88-demo-kolora",
        texts: [
          "型号档案",
          "Demo / Kolora",
          "把滴入式大容量当作 Opus 88 的阅读入口",
          "滴入式上墨",
          "Opus 88: Demo",
        ],
      },
      {
        path: "/pen/%E6%96%BD%E8%80%90%E5%BE%B7-schneider-bk402",
        texts: [
          "型号档案",
          "BK402",
          "把学生笔放回德国办公文具工业里",
          "墨囊",
          "Schneider: BK402",
        ],
      },
    ];

    for (const item of cases) {
      await expectLibraryPage(page, item.path, item.texts);
    }
  });

  test("expanded Montblanc collectable and Meisterstuck archives render cautious sources", async ({
    page,
  }) => {
    const cases = [
      {
        path: `/pen/${encodeURIComponent("万宝龙-montblanc-大班146")}`,
        texts: [
          "型号档案",
          "Meisterstück LeGrand",
          "把 146 当作 LeGrand 尺寸线来读",
          "Au 585 / 14 K",
          "Montblanc: Meisterstück Gold-Coated LeGrand",
        ],
      },
      {
        path: `/pen/${encodeURIComponent("万宝龙-montblanc-144")}`,
        texts: [
          "型号档案",
          "Classique / 144",
          "把 vintage 144 和现代 Classique 谨慎分开读",
          "piston converter",
          "Montblanc: Meisterstück Gold-Coated Classique",
        ],
      },
      {
        path: `/pen/${encodeURIComponent("万宝龙-montblanc-大文豪系列-writers-edition")}`,
        texts: [
          "型号档案",
          "Writers Edition",
          "把文学致敬系列作为可拆展柜来读",
          "Issued annually since 1992",
          "Montblanc: Writers Edition",
        ],
      },
      {
        path: `/pen/${encodeURIComponent("万宝龙-montblanc-patron-of-art-888")}`,
        texts: [
          "型号档案",
          "Patron of Art 888",
          "把艺术赞助人系列和 888 限量拆开读",
          "Limitation 888",
          "Montblanc: Patron of Art",
        ],
      },
    ];

    for (const item of cases) {
      await expectLibraryPage(page, item.path, item.texts);
    }
  });

  test("expanded TWSBI compact and spring-piston archives render official sources", async ({
    page,
  }) => {
    const cases = [
      {
        path: `/pen/${encodeURIComponent("三文堂-twsbi-diamond-mini-al")}`,
        texts: [
          "型号档案",
          "Diamond Mini AL",
          "把 580 的活塞示范笔缩成随身尺寸",
          "Aluminum Parts",
          "TWSBI: Diamond Mini AL Silver Fountain Pen",
        ],
      },
      {
        path: `/pen/${encodeURIComponent("三文堂-twsbi-go")}`,
        texts: [
          "型号档案",
          "GO",
          "把弹簧活塞做成入门透明实验笔",
          "Spring loaded piston",
          "TWSBI: GO Clear Fountain Pen",
        ],
      },
    ];

    for (const item of cases) {
      await expectLibraryPage(page, item.path, item.texts);
    }
  });

  test("official model diagram index includes evidence-aware diagrams", async ({
    page,
  }) => {
    await expectLibraryPage(page, "/library/diagrams", [
      "Sailor Pro Gear 系列关系示意",
      "Platinum #3776 Century 档案拆解图",
      "Kaweco Sport 口袋笔比例示意",
      "Montblanc 149 证据边界图",
    ]);
  });

  test("local graph stays visible after horizontal drag", async ({ page }) => {
    await page.goto("/pen/%E6%B0%B8%E7%94%9F-wingsung-601a", {
      waitUntil: "networkidle",
    });

    const canvas = page.locator('[data-testid="local-graph-canvas"] canvas');
    await canvas.scrollIntoViewIfNeeded();
    await expect(canvas).toBeVisible();
    await page.waitForTimeout(2500);

    const before = await getCanvasPixelBounds(page);
    expect(before).not.toBeNull();
    expect(before?.width).toBeGreaterThan(300);

    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;

    await page.mouse.move(box.x + box.width * 0.62, box.y + box.height * 0.55);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width + 220, box.y + box.height * 0.55, {
      steps: 16,
    });
    await page.mouse.up();
    await page.waitForTimeout(800);

    const after = await getCanvasPixelBounds(page);
    expect(after).not.toBeNull();
    expect(after?.width).toBeGreaterThan(300);
    expect(after?.maxX).toBeLessThan((after?.canvasWidth || 0) - 12);
  });

  test("related entities do not repeat sidebar content", async ({ page }) => {
    await page.goto("/pen/%E6%B0%B8%E7%94%9F-wingsung-601a", {
      waitUntil: "domcontentloaded",
    });

    await expect(page.getByRole("heading", { name: "关联词条" })).toHaveCount(
      1,
    );
    await expect(page.locator('a[href="/brand/wingsung"]')).toHaveCount(1);
  });

  test("article markdown renders proxied images and captions", async ({
    page,
  }) => {
    await expectLibraryPage(page, "/article/the-baguio-surrender-pens", [
      "碧瑶投降签字用笔",
      "1970年代圣母明信片",
      "卡西比尔停战协定用笔",
      "来源卡片",
      "Richard's Pens",
      "summary_only",
    ]);

    const heroImage = page.locator(".image-figure img").first();
    await expect(heroImage).toHaveAttribute("src", /\/api\/image-proxy/);
    expect(await heroImage.getAttribute("onerror")).toBeNull();
  });
});
