// 商品价格批量修改脚本 - async/await 串行版
(async function () {
  // 创建价格输入弹窗
  const priceInput = prompt("请输入目标价格（默认：2.99）：", "2.99");
  if (priceInput === null) {
    console.log("操作已取消");
    return;
  }

  const targetPrice = priceInput.trim() || "2.99"; // 目标价格
  const baseDelay = 1000; // 操作间隔（毫秒）

  // 等待页面加载
  await new Promise((r) => setTimeout(r, 1000));

  const priceCells = Array.from(document.querySelectorAll(".item-price-cell"));
  console.log(`🔍 找到 ${priceCells.length} 个价格单元格`);
  priceCells.forEach((cell, i) => {
    console.log(`🔍 价格单元格${i + 1}:`, cell.textContent.trim());
  });

  if (priceCells.length === 0) {
    console.error(
      '❌ 未找到类名为 "item-price-cell" 的元素，请确认类名是否正确'
    );
    return;
  }

  if (
    !window.confirm(
      `即将修改 ${priceCells.length} 个商品价格为 ${targetPrice}，确认继续？`
    )
  ) {
    console.log("操作已取消");
    return;
  }

  console.log(`✅ 开始批量修改 ${priceCells.length} 个商品价格...`);

  // 处理所有商品
  for (let i = 0; i < priceCells.length; i++) {
    await processPriceCell(priceCells[i], i + 1);
    console.log(`已处理 ${i + 1} 个商品，剩余 ${priceCells.length - i - 1} 个`);
    await new Promise((r) => setTimeout(r, baseDelay));
  }
  console.log("✅ 所有商品处理完成！");

  // 处理单个价格单元格的函数
  async function processPriceCell(cell, index) {
    try {
      console.log(`🔍 [${index}] 开始处理价格单元格`);
      console.log(`🔍 [${index}] 单元格内容:`, cell.textContent.trim());
      // 1. 悬停
      cell.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
      console.log(`[${index}] ➤ 已悬停到价格单元格`);
      // 2. 查找编辑按钮
      const editBtn = cell.querySelector(".opera-icon");
      if (!editBtn) {
        console.error(`[${index}] ❌ 未找到编辑按钮（.opera-icon）`);
        return;
      }
      // 3. 点击编辑按钮
      editBtn.click();
      console.log(`[${index}] ➤ 已点击编辑按钮，等待弹窗出现`);
      // 4. 等待弹窗出现
      const popup = await waitForElement(".edit-price-modal");
      if (!popup) {
        console.error(`[${index}] ❌ 未检测到价格编辑弹窗`);
        return;
      }
      // 5. 查找输入框
      console.log(`[${index}] 🔍 开始查找输入框...`);

      // 先检查是否有tbody
      const tbody = popup.querySelector("tbody");
      console.log(`[${index}] 🔍 是否找到tbody:`, tbody ? "是" : "否");
      console.log("tbody", tbody);
      // 查找所有.d-input-number-main
      const allInputParents = tbody.querySelectorAll(".d-input-number-main");
      console.log(
        `[${index}] 🔍 找到 ${allInputParents.length} 个.d-input-number-main`
      );

      // 查找tbody内的.d-input-number-main
      const tbodyInputParents = tbody.querySelectorAll(".d-input-number-main");
      console.log(
        `[${index}] 🔍 找到 ${tbodyInputParents.length} 个tbody内的.d-input-number-main`
      );

      if (tbodyInputParents.length === 0) {
        console.error(`[${index}] ❌ 弹窗中未找到输入框父级`);
        // console.log(`[${index}] 弹窗HTML结构：`, popup.innerHTML);
        return;
      }

      // 选择第一个输入框（售价）
      const inputParent = tbodyInputParents[0];
      console.log(`[${index}] ✅ 选择第一个输入框（售价）`);
      console.log(`[${index}] ✅ 找到输入框父级`);

      const inputField = inputParent.querySelector("input");
      if (!inputField) {
        console.error(`[${index}] ❌ 未在售价输入框父级中找到input`);
        return;
      }
      console.log(`[${index}] ✅ 找到输入框，当前值:`, inputField.value);
      console.log(`[${index}] 🔍 输入框属性:`, {
        type: inputField.type,
        placeholder: inputField.placeholder,
        disabled: inputField.disabled,
        readonly: inputField.readOnly,
        className: inputField.className,
        id: inputField.id,
      });

      // 检查输入框是否可编辑
      if (inputField.disabled || inputField.readOnly) {
        console.error(`[${index}] ❌ 输入框被禁用或只读`);
        return;
      }

      // 6. 填入价格并触发事件（模拟逐字输入）
      console.log(`[${index}] 🔍 开始模拟输入价格: ${targetPrice}`);
      await simulateInput(inputField, targetPrice);
      console.log(`[${index}] ✅ 输入完成，当前值:`, inputField.value);

      // 验证价格是否真的改变了
      if (inputField.value === targetPrice) {
        console.log(`[${index}] ✅ 价格修改成功: ${targetPrice}`);
      } else {
        console.error(
          `[${index}] ❌ 价格修改失败，期望: ${targetPrice}，实际: ${inputField.value}`
        );
      }
      // 7. 查找并点击确认按钮
      const confirmBtn = popup.querySelector(
        ".d-button-with-content.--color-bg-primary"
      );
      if (confirmBtn) {
        const rect = confirmBtn.getBoundingClientRect();
        confirmBtn.dispatchEvent(
          new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: rect.left + rect.width / 2,
            clientY: rect.top + rect.height / 2,
          })
        );
        console.log(`[${index}] ➤ 已点击弹窗确认按钮`);
      } else {
        console.log(`[${index}] ⚠️ 未找到确认按钮，请手动确认`);
        return;
      }
      // 8. 立即检查是否有二次确认弹窗（不需要等待第一个弹窗关闭）
      console.log(`[${index}] ➤ 检查是否有二次确认弹窗`);

      // 先检查页面上是否有.d-modal-default元素
      const existingModal = document.querySelector(".d-modal-default");
      console.log(
        `[${index}] 🔍 页面上是否有.d-modal-default:`,
        existingModal ? "是" : "否"
      );

      const secondPopup = await waitForElement(".d-modal-default").catch(
        () => null
      );

      if (secondPopup) {
        console.log(`[${index}] ➤ 检测到二次确认弹窗`);
        console.log(`[${index}] 🔍 二次弹窗HTML:`, secondPopup.outerHTML);

        // 延迟0.5秒让弹窗完全渲染
        await new Promise((r) => setTimeout(r, 200));

        // 调试：打印所有按钮信息
        const allButtons = secondPopup.querySelectorAll("button");
        console.log(
          `[${index}] 🔍 二次弹窗内找到 ${allButtons.length} 个按钮:`
        );
        allButtons.forEach((btn, i) => {
          console.log(
            `[${index}] 🔍 按钮${i + 1}:`,
            btn.className,
            btn.textContent.trim()
          );
        });

        // 简单直接：找到包含"确定"文本的按钮并点击
        const confirmBtn = Array.from(
          secondPopup.querySelectorAll("button")
        ).find((btn) => btn.textContent.trim().includes("确定"));
        confirmBtn.style.color = "red";
        console.log(
          `[${index}] 🔍 是否找到确定按钮:`,
          confirmBtn ? "是" : "否"
        );

        if (confirmBtn) {
          console.log(`[${index}] ➤ 找到确定按钮，准备点击`);
          console.log(
            `[${index}] 🔍 确定按钮文本:`,
            confirmBtn.textContent.trim()
          );
          console.log(`[${index}] 🔍 确定按钮类名:`, confirmBtn.className);

          // 延迟一下确保按钮可点击
          await new Promise((r) => setTimeout(r, 200));
          console.log("c!!!!!onfirmBtn", confirmBtn);
          // 模拟真实的鼠标点击事件
          const rect = confirmBtn.getBoundingClientRect();
          confirmBtn.dispatchEvent(
            new MouseEvent("mousedown", {
              bubbles: true,
              cancelable: true,
              view: window,
              clientX: rect.left + rect.width / 2,
              clientY: rect.top + rect.height / 2,
            })
          );
          confirmBtn.dispatchEvent(
            new MouseEvent("mouseup", {
              bubbles: true,
              cancelable: true,
              view: window,
              clientX: rect.left + rect.width / 2,
              clientY: rect.top + rect.height / 2,
            })
          );
          confirmBtn.dispatchEvent(
            new MouseEvent("click", {
              bubbles: true,
              cancelable: true,
              view: window,
              clientX: rect.left + rect.width / 2,
              clientY: rect.top + rect.height / 2,
            })
          );
          console.log(`[${index}] ➤ 已模拟点击确定按钮`);
          await waitForElementDisappear(".d-modal-default", 500);
          console.log(`[${index}] ➤ 二次确认弹窗已关闭`);
        } else {
          console.log(`[${index}] ❌ 未找到确定按钮，请手动确认`);
        }
      } else {
        console.log(`[${index}] ➤ 没有二次确认弹窗（价格可能和上次相同）`);
      }
    } catch (error) {
      console.error(`[${index}] ❌ 处理异常:`, error);
    }
  }

  // 等待元素出现（固定1秒）
  function waitForElement(selector, waitTime = 1000) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const element = document.querySelector(selector);
        resolve(element);
      }, waitTime);
    });
  }
  // 等待元素消失
  function waitForElementDisappear(selector, waitTime = 1000) {
    return new Promise((resolve, reject) => {
      if (!document.querySelector(selector)) {
        resolve();
        return;
      }
      const observer = new MutationObserver(() => {
        if (!document.querySelector(selector)) {
          observer.disconnect();
          resolve();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => {
        observer.disconnect();
        if (!document.querySelector(selector)) {
          resolve();
        } else {
          reject(new Error(`元素 ${selector} 未消失（超时 ${timeout}ms）`));
        }
      }, waitTime);
    });
  }
  // 模拟逐字输入
  async function simulateInput(input, value) {
    // 聚焦
    input.focus();
    await new Promise((r) => setTimeout(r, 50));

    // 清空
    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 25));

    // 设置新值
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    input.dispatchEvent(new Event("blur", { bubbles: true }));

    // 等待页面处理
    await new Promise((r) => setTimeout(r, 100));
  }
})();
