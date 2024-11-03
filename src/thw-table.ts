import { LitElement, html, css, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Ref, createRef, ref } from "lit/directives/ref.js";
import { repeat } from "lit/directives/repeat.js";
import { VirtualizerController } from "@tanstack/lit-virtual";
import { thwColors, grayColors } from "./colors";

/**
 * A table component.
 * @param {string[]} header - The header of the table.
 * @param {string[][]} values - The values of the table.
 * @param {Function} onValueClick - The callback function when a table row is clicked.
 * @param {number | undefined} selectedIndex - The index of the selected row.
 * @param {number | undefined} maxHeight - The maximum height of the table.
 */
@customElement("thw-table")
export class THWTable extends LitElement {
  @property({ type: Array }) header: string[] = [];
  @property({ type: Array }) values: string[][] = [];
  @property({ attribute: false }) onValueClick?: (
    row: string[],
    index: number
  ) => void;
  @property({ type: Number }) selectedIndex?: number;
  @property({ type: Number }) maxHeight?: number;

  private scrollElementRef: Ref<HTMLDivElement> = createRef();
  private virtualizerController: VirtualizerController<HTMLDivElement, Element>;

  constructor() {
    super();
    this.virtualizerController = new VirtualizerController(this, {
      getScrollElement: () => this.scrollElementRef.value!,
      count: this.values.length,
      estimateSize: () => 41,
      overscan: 5,
    });
  }

  static override styles = css`
    .table-wrapper {
      overflow: auto;
    }
    .header {
      position: sticky;
      top: 0;
      z-index: 1;
      background-color: ${unsafeCSS(thwColors[100])};
      display: flex;
      border-top-left-radius: 0.5rem;
      border-top-right-radius: 0.5rem;
    }
    .header-cell {
      padding: 0.5rem 1rem;
      font-weight: 600;
      color: ${unsafeCSS(thwColors[900])};
      flex: 1;
      text-align: left;
    }
    .row {
      display: flex;
      transition: background-color 0.2s, color 0.2s;
      border-bottom: 1px solid #e2e8f0;
    }
    .cell {
      padding: 0.5rem 1rem;
      flex: 1;
    }
    .row:hover {
      background-color: ${unsafeCSS(thwColors[200])};
      cursor: pointer;
    }
    .row.selected {
      background-color: ${unsafeCSS(thwColors[700])};
      color: white;
    }
    .table-container {
      border: 1px solid #e6e4dc;
      border-radius: 0.5rem;
      background: white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .table-info {
      padding: 0.5rem 1rem;
      color: ${unsafeCSS(grayColors[400])};
      font-size: 0.875rem;
      border-top: 1px solid #e2e8f0;
    }
  `;

  override render() {
    const virtualizer = this.virtualizerController.getVirtualizer();
    const virtualRows = virtualizer.getVirtualItems();

    const firstItem = virtualRows[0]?.index + 1 || 0;
    const lastItem = virtualRows[virtualRows.length - 1]?.index + 1 || 0;
    const totalItems = this.values.length;

    return html`
      <div class="table-container">
        <div
          class="table-wrapper"
          style=${this.maxHeight ? `height: ${this.maxHeight}px;` : ""}
          ${ref(this.scrollElementRef)}
        >
          <div class="header">
            ${this.header.map(
              (title) => html`<div class="header-cell">${title}</div>`
            )}
          </div>
          <div
            style="position: relative; height: ${virtualizer.getTotalSize()}px; width: 100%;"
          >
            ${repeat(
              virtualRows,
              (virtualRow) => virtualRow.key,
              (virtualRow) => {
                const row = this.values[virtualRow.index];
                return html`
                  <div
                    class="row ${this.selectedIndex === virtualRow.index
                      ? "selected"
                      : ""}"
                    style="position: absolute; top: 0; left: 0; width: 100%; height: ${virtualRow.size}px; transform: translateY(${virtualRow.start}px);"
                    @click=${() => this.handleRowClick(row, virtualRow.index)}
                  >
                    ${row.map((cell) => html`<div class="cell">${cell}</div>`)}
                  </div>
                `;
              }
            )}
          </div>
        </div>
        <div class="table-info">
          Zeige ${firstItem}-${lastItem} von ${totalItems} Einträgen
        </div>
      </div>
    `;
  }

  private handleRowClick(row: string[], index: number) {
    if (this.onValueClick) {
      this.selectedIndex = index;
      this.onValueClick(row, index);
    }
  }

  willUpdate(changedProperties: Map<string, any>) {
    if (changedProperties.has("values")) {
      // Create new controller with updated count
      this.virtualizerController = new VirtualizerController(this, {
        getScrollElement: () => this.scrollElementRef.value!,
        count: this.values.length,
        estimateSize: () => 41,
        overscan: 5,
      });
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "thw-table": THWTable;
  }
}
