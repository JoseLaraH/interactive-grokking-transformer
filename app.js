const svgNamespace = "http://www.w3.org/2000/svg";
    const mlpConnections = document.querySelector("#mlp-connections");
    const mlpColumns = [
      [...document.querySelectorAll("#mlp-left-column .mlp-node")],
      [...document.querySelectorAll("#mlp-middle-column .mlp-node")],
      [...document.querySelectorAll("#mlp-right-column .mlp-node")],
    ];

    function connectMlpColumns(sourceNodes, targetNodes) {
      sourceNodes.forEach((source) => {
        targetNodes.forEach((target) => {
          const connection = document.createElementNS(svgNamespace, "line");
          connection.setAttribute("class", "mlp-connection");
          connection.setAttribute("x1", source.getAttribute("cx"));
          connection.setAttribute("y1", source.getAttribute("cy"));
          connection.setAttribute("x2", target.getAttribute("cx"));
          connection.setAttribute("y2", target.getAttribute("cy"));
          mlpConnections.appendChild(connection);
        });
      });
    }

    connectMlpColumns(mlpColumns[0], mlpColumns[1]);
    connectMlpColumns(mlpColumns[1], mlpColumns[2]);

    const diagram = document.querySelector(".diagram");
    const trigger = document.querySelector("#embedding-trigger");
    const pipelineTriggers = [...document.querySelectorAll(".pipeline-trigger")];
    const outputTrigger = document.querySelector("#output-trigger");
    const logitView = document.querySelector("#logit-view");
    const logitFrame = document.querySelector("#logit-frame");
    const logitBack = document.querySelector("#logit-back");
    const back = document.querySelector("#embedding-back");
    const tokenTemplate = document.querySelector("#token-block");
    const tokenBlocks = [...document.querySelectorAll(".token-block-instance")];
    const tokenEmbeddingVisual = document.querySelector(
      "#token-embedding-visual"
    );
    const tokenEmbeddingSubtitle = document.querySelector(
      "#token-embedding-subtitle"
    );
    const embeddingEquals = document.querySelector("#embedding-equals");
    const h0Visual = document.querySelector("#h0-visual");
    const h0Cells = document.querySelector("#h0-cells");
    const initialH0Visual = document.querySelector("#initial-h0-visual");
    const outputCells = [...document.querySelectorAll(".output-cell")];
    const outputResultCell = document.querySelector("#output-result-cell");
    const outputResultLabel = document.querySelector("#output-result-label");
    const selectedTokenRows = new Map([["147", "312"]]);
    const tokenValueByRow = new Map([
      ["69", 0],
      ["93", 1],
      ["117", 2],
      ["141", 3],
      ["165", 4],
      ["189", 5],
      ["213", 6],
      ["286", 112],
      ["312", 113],
    ]);
    let finalizeTimer = null;
    let embeddingTransitionTimer = null;
    let embeddingIsCompact = false;

    [116, 144, 172].forEach((rowY) => {
      [
        [764, 7],
        [792, 7],
        [820, 7],
        [848, 7],
        [876, 7],
        [902, 2.5],
        [916, 2.5],
        [930, 2.5],
        [962, 7],
        [1002, 7],
      ].forEach(([columnX, radius]) => {
        const cell = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle"
        );
        cell.setAttribute("class", "tiny-dot");
        cell.setAttribute("cx", columnX);
        cell.setAttribute("cy", rowY);
        cell.setAttribute("r", radius);
        h0Cells.appendChild(cell);
      });
    });

    tokenEmbeddingVisual.querySelectorAll("circle").forEach((cell) => {
      if (Number(cell.getAttribute("cy")) >= 199) {
        cell.classList.add("full-token-row");
      }
    });

    const embeddingLevelClasses = [
      "embedding-level-1",
      "embedding-level-2",
      "embedding-level-3",
      "embedding-level-4",
      "embedding-level-5",
    ];

    function setEmbeddingCellLevel(cell, level) {
      cell.classList.remove(...embeddingLevelClasses);
      if (level > 0) {
        cell.classList.add(`embedding-level-${level}`);
      }
    }

    function getEmbeddingLevel(seed, index, rowY) {
      return Math.abs(seed * 31 + index * 17 + rowY) % 6;
    }

    function setEmbeddingRowPattern(container, rowY, seed, active = true) {
      const cells = [...container.querySelectorAll(`circle[cy="${rowY}"]`)];
      cells.forEach((cell, index) => {
        const level = active ? getEmbeddingLevel(seed, index, rowY) : 0;
        setEmbeddingCellLevel(cell, level);
      });
    }

    function syncInitialH0Pattern(selectedValues, active) {
      const visibleDimensionIndexes = [0, 1, 2, 3, 4, 8, 9];
      const columnXs = [296, 315, 334];
      const largeRowYs = [112, 136, 160, 184, 208, 271, 295];

      columnXs.forEach((columnX, position) => {
        const seed = (selectedValues[position] ?? 0) + position + 1;
        largeRowYs.forEach((rowY, visibleIndex) => {
          const cell = initialH0Visual.querySelector(
            `circle[cx="${columnX}"][cy="${rowY}"]`
          );
          const patternIndex = visibleDimensionIndexes[visibleIndex];
          const level = active
            ? getEmbeddingLevel(
                seed,
                patternIndex,
                [116, 144, 172][position]
              )
            : 0;
          if (cell) setEmbeddingCellLevel(cell, level);
        });
      });
    }

    function setTokenEmbeddingCompact(shouldCompact) {
      if (shouldCompact === embeddingIsCompact) return;

      window.clearTimeout(embeddingTransitionTimer);
      embeddingIsCompact = shouldCompact;

      if (shouldCompact) {
        // First simplify the 114-row content, then shrink its container.
        diagram.classList.add("token-embedding-content-compact");
        embeddingTransitionTimer = window.setTimeout(() => {
          diagram.classList.add("token-embedding-panel-compact");
        }, 320);
      } else {
        // First restore the full container, then reveal all 114-row cues.
        diagram.classList.remove("token-embedding-panel-compact");
        embeddingTransitionTimer = window.setTimeout(() => {
          diagram.classList.remove("token-embedding-content-compact");
        }, 480);
      }
    }

    function syncEmbeddingVisuals() {
      const tokenVisual = document.querySelector("#token-embedding-visual");
      const positionVisual = document.querySelector("#position-embedding-visual");
      if (!tokenVisual || !positionVisual) return;

      const hasAssignedInput =
        selectedTokenRows.has("92") || selectedTokenRows.has("119.5");
      const hasCompleteInput =
        selectedTokenRows.has("92") && selectedTokenRows.has("119.5");
      setTokenEmbeddingCompact(hasAssignedInput);
      embeddingEquals.classList.toggle("enabled", hasCompleteInput);
      embeddingEquals.setAttribute(
        "aria-disabled",
        String(!hasCompleteInput)
      );
      if (!hasCompleteInput) {
        diagram.classList.remove("h0-result");
      }
      tokenEmbeddingSubtitle.textContent = hasAssignedInput
        ? "3 tokens seleccionados x 128 dimensiones"
        : "114 tokens x 128 dimensiones";

      const selectedValues = [
        tokenValueByRow.get(selectedTokenRows.get("92")),
        tokenValueByRow.get(selectedTokenRows.get("119.5")),
        113,
      ];
      const tokenRows = [116, 144, 172];
      const tokenLabels = [
        document.querySelector("#token-embedding-row-x"),
        document.querySelector("#token-embedding-row-y"),
        document.querySelector("#token-embedding-row-eq"),
      ];

      if (hasAssignedInput) {
        selectedValues.forEach((value, index) => {
          tokenLabels[index].textContent =
            value === undefined ? "-" : String(value);
          setEmbeddingRowPattern(
            tokenVisual,
            tokenRows[index],
            value ?? 0,
            value !== undefined
          );
        });
      } else {
        tokenLabels.forEach((label, index) => {
          label.textContent = String(index);
        });

        [
          [116, 0],
          [144, 1],
          [172, 2],
          [252, 112],
          [280, 113],
        ].forEach(([rowY, tokenValue]) => {
          setEmbeddingRowPattern(tokenVisual, rowY, tokenValue);
        });
      }

      [116, 144, 172].forEach((rowY, position) => {
        setEmbeddingRowPattern(positionVisual, rowY, position + 1);
      });

      if (hasCompleteInput) {
        selectedValues.forEach((value, position) => {
          setEmbeddingRowPattern(
            h0Visual,
            tokenRows[position],
            value + position + 1
          );
        });
      }
      syncInitialH0Pattern(selectedValues, hasCompleteInput);
      syncOutputResult(selectedValues, hasCompleteInput);
    }

    function syncOutputResult(selectedValues, hasCompleteInput) {
      outputCells.forEach((cell) => {
        cell.classList.remove("selected");
        setEmbeddingCellLevel(cell, 0);
      });

      if (!hasCompleteInput) {
        outputResultLabel.textContent = "7";
        outputResultCell.dataset.value = "7";
        return;
      }

      const result = (selectedValues[0] + selectedValues[1]) % 113;
      let resultCell = outputCells.find(
        (cell) => Number(cell.dataset.value) === result
      );

      if (!resultCell) {
        outputResultLabel.textContent = String(result);
        outputResultCell.dataset.value = String(result);
        resultCell = outputResultCell;
      } else {
        outputResultLabel.textContent = "7";
        outputResultCell.dataset.value = "7";
        if (result === 7) {
          resultCell = outputResultCell;
        }
      }

      const alternatives = outputCells
        .filter((cell) => cell !== resultCell)
        .sort((left, right) => {
          const leftValue = Number(left.dataset.value);
          const rightValue = Number(right.dataset.value);
          return (
            ((leftValue * 17 + result * 13) % 113) -
            ((rightValue * 17 + result * 13) % 113)
          );
        })
        .slice(0, 2);

      alternatives.forEach((cell, index) => {
        setEmbeddingCellLevel(cell, index === 0 ? 2 : 1);
      });
      setEmbeddingCellLevel(resultCell, 5);
    }

    function syncTokenSelections() {
      document
        .querySelectorAll(".token-block-instance .grid-dot")
        .forEach((cell) => {
          const column = cell.getAttribute("cx");
          const row = cell.getAttribute("cy");
          cell.classList.toggle(
            "selected",
            selectedTokenRows.get(column) === row
          );
        });
      syncEmbeddingVisuals();
    }

    function selectTokenCell(event) {
      event.stopPropagation();
      const cell = event.currentTarget;
      const column = cell.getAttribute("cx");

      // The third input is always the "=" token at row 113.
      if (column === "147") return;

      const row = cell.getAttribute("cy");
      if (row === "312") return;

      if (selectedTokenRows.get(column) === row) {
        selectedTokenRows.delete(column);
      } else {
        selectedTokenRows.set(column, row);
      }
      syncTokenSelections();
    }

    tokenBlocks.forEach((tokenBlock) => {
      [...tokenTemplate.children].forEach((child) => {
        tokenBlock.appendChild(child.cloneNode(true));
      });

      tokenBlock.querySelectorAll(".grid-dot").forEach((cell) => {
        cell.addEventListener("click", selectTokenCell);
      });
    });

    syncTokenSelections();

    function enterEmbeddingFocus() {
      window.clearTimeout(finalizeTimer);
      diagram.classList.remove("embedding-final");
      syncEmbeddingVisuals();
      diagram.classList.add("embedding-focus");
      finalizeTimer = window.setTimeout(() => {
        diagram.classList.add("embedding-final");
      }, 560);
    }

    function exitEmbeddingFocus() {
      window.clearTimeout(finalizeTimer);
      window.clearTimeout(embeddingTransitionTimer);
      diagram.classList.remove("h0-result");
      diagram.classList.remove("embedding-final");
      diagram.classList.remove("embedding-focus");
    }

    function showH0Result() {
      const hasCompleteInput =
        selectedTokenRows.has("92") && selectedTokenRows.has("119.5");
      if (hasCompleteInput) {
        diagram.classList.toggle("h0-result");
      }
    }

    function flashPipelineBlock(selectedTrigger) {
      selectedTrigger.classList.add("clicked");
      window.setTimeout(() => {
        selectedTrigger.classList.remove("clicked");
      }, 180);
    }

    pipelineTriggers.forEach((blockTrigger) => {
      blockTrigger.addEventListener("click", () => {
        flashPipelineBlock(blockTrigger);
      });
      blockTrigger.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          blockTrigger.click();
        }
      });
    });

    function openLogitView() {
      if (!logitFrame.getAttribute("src")) {
        logitFrame.src = logitFrame.dataset.src;
      }
      document.body.classList.add("logit-open");
      logitView.setAttribute("aria-hidden", "false");
      window.setTimeout(() => {
        logitFrame.contentWindow?.dispatchEvent(new Event("resize"));
        logitBack.focus();
      }, 520);
    }

    function closeLogitView() {
      document.body.classList.remove("logit-open");
      logitView.setAttribute("aria-hidden", "true");
      window.setTimeout(() => outputTrigger.focus(), 520);
    }

    outputTrigger.addEventListener("click", openLogitView);
    logitBack.addEventListener("click", closeLogitView);

    trigger.addEventListener("click", enterEmbeddingFocus);

    back.addEventListener("click", exitEmbeddingFocus);

    embeddingEquals.addEventListener("click", showH0Result);
    embeddingEquals.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        showH0Result();
      }
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        if (document.body.classList.contains("logit-open")) {
          closeLogitView();
        } else {
          exitEmbeddingFocus();
        }
      }
    });
