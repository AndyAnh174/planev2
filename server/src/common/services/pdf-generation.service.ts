import { Injectable, Logger } from "@nestjs/common";
import { WorkspaceExportData, PageExportData, BoardExportData, FileExportData } from "../../workspaces/dto/workspace-export.dto";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

@Injectable()
export class PDFGenerationService {
  private readonly logger = new Logger(PDFGenerationService.name);

  // Define styles for PDF
  private styles = StyleSheet.create({
    page: {
      padding: 40,
      fontSize: 12,
      fontFamily: "Helvetica",
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginTop: 20,
      marginBottom: 10,
    },
    section: {
      marginBottom: 15,
    },
    text: {
      marginBottom: 5,
    },
    table: {
      display: "flex",
      flexDirection: "column",
      marginTop: 10,
    },
    tableRow: {
      flexDirection: "row",
      borderBottom: "1pt solid #ddd",
      padding: 5,
    },
    tableHeader: {
      fontWeight: "bold",
      backgroundColor: "#f0f0f0",
    },
    tableCell: {
      flex: 1,
      padding: 5,
    },
  });

  /**
   * Generate PDF buffer from workspace export data
   */
  async generateWorkspacePDF(exportData: WorkspaceExportData): Promise<Buffer> {
    try {
      const doc = React.createElement(
        Document,
        null,
        // Title Page
        React.createElement(
          Page,
          { size: "A4", style: this.styles.page },
          React.createElement(
            View,
            null,
            React.createElement(Text, { style: this.styles.title }, exportData.workspace.name),
            exportData.workspace.description &&
              React.createElement(
                Text,
                { style: this.styles.text },
                exportData.workspace.description
              ),
            React.createElement(
              Text,
              { style: this.styles.text },
              "Exported: ",
              new Date(exportData.exportedAt).toLocaleString()
            ),
            React.createElement(
              Text,
              { style: this.styles.text },
              "Owner: ",
              exportData.workspace.owner?.username ||
                exportData.workspace.owner?.email ||
                "Unknown"
            ),
            React.createElement(
              Text,
              { style: this.styles.text },
              "Members: ",
              exportData.workspace.members.length.toString()
            ),
            React.createElement(
              Text,
              { style: this.styles.text },
              "Pages: ",
              exportData.pages.length.toString()
            ),
            React.createElement(
              Text,
              { style: this.styles.text },
              "Boards: ",
              exportData.boards.length.toString()
            ),
            React.createElement(
              Text,
              { style: this.styles.text },
              "Files: ",
              exportData.files.length.toString()
            )
          )
        ),

        // Pages Section
        exportData.pages.length > 0 &&
          React.createElement(
            React.Fragment,
            null,
            React.createElement(
              Page,
              { size: "A4", style: this.styles.page },
              React.createElement(
                View,
                null,
                React.createElement(Text, { style: this.styles.subtitle }, "Pages"),
                exportData.pages.map((page, index) =>
                  React.createElement(
                    View,
                    { key: page.id, style: this.styles.section },
                    index === 0 ? null : React.createElement(Text, { style: this.styles.text }, "\n"),
                    React.createElement(
                      Text,
                      { style: this.styles.text },
                      React.createElement(Text, { style: { fontWeight: "bold" } }, page.title),
                      "\n",
                      "Slug: ",
                      page.slug,
                      "\n",
                      "Visibility: ",
                      page.visibility,
                      "\n",
                      "Blocks: ",
                      page.blocks.length.toString(),
                      "\n",
                      "Created: ",
                      new Date(page.createdAt).toLocaleString(),
                      "\n",
                      "Updated: ",
                      new Date(page.updatedAt).toLocaleString()
                    ),
                    page.blocks.length > 0 &&
                      React.createElement(
                        View,
                        { style: { marginLeft: 20, marginTop: 5 } },
                        page.blocks.slice(0, 5).map((block) =>
                          React.createElement(
                            Text,
                            { key: block.id, style: this.styles.text },
                            "- [",
                            block.type,
                            "] ",
                            this.formatBlockContent(block)
                          )
                        ),
                        page.blocks.length > 5 &&
                          React.createElement(
                            Text,
                            { style: this.styles.text },
                            "... and ",
                            (page.blocks.length - 5).toString(),
                            " more blocks"
                          )
                      )
                  )
                )
              )
            )
          ),

        // Boards Section
        exportData.boards.length > 0 &&
          React.createElement(
            Page,
            { size: "A4", style: this.styles.page },
            React.createElement(
              View,
              null,
              React.createElement(Text, { style: this.styles.subtitle }, "Boards"),
              exportData.boards.map((board) =>
                React.createElement(
                  View,
                  { key: board.id, style: this.styles.section },
                  React.createElement(
                    Text,
                    { style: this.styles.text },
                    React.createElement(Text, { style: { fontWeight: "bold" } }, board.name),
                    board.description && `\n${board.description}`,
                    "\n",
                    "Cards: ",
                    board.cards.length.toString(),
                    "\n",
                    "Created: ",
                    new Date(board.createdAt).toLocaleString()
                  ),
                  board.cards.length > 0 &&
                    React.createElement(
                      View,
                      { style: { marginLeft: 20, marginTop: 5 } },
                      board.cards.slice(0, 10).map((card) =>
                        React.createElement(
                          Text,
                          { key: card.id, style: this.styles.text },
                          "- ",
                          card.title,
                          " [",
                          card.status,
                          "]",
                          card.description &&
                            ` - ${card.description.substring(0, 50)}...`
                        )
                      ),
                      board.cards.length > 10 &&
                        React.createElement(
                          Text,
                          { style: this.styles.text },
                          "... and ",
                          (board.cards.length - 10).toString(),
                          " more cards"
                        )
                    )
                )
              )
            )
          ),

        // Files Section
        exportData.files.length > 0 &&
          React.createElement(
            Page,
            { size: "A4", style: this.styles.page },
            React.createElement(
              View,
              null,
              React.createElement(Text, { style: this.styles.subtitle }, "Files"),
              React.createElement(
                View,
                { style: this.styles.table },
                React.createElement(
                  View,
                  { style: [this.styles.tableRow, this.styles.tableHeader] },
                  React.createElement(Text, { style: this.styles.tableCell }, "Name"),
                  React.createElement(Text, { style: this.styles.tableCell }, "Type"),
                  React.createElement(Text, { style: this.styles.tableCell }, "Size"),
                  React.createElement(Text, { style: this.styles.tableCell }, "Uploaded")
                ),
                exportData.files.map((file) =>
                  React.createElement(
                    View,
                    { key: file.id, style: this.styles.tableRow },
                    React.createElement(
                      Text,
                      { style: this.styles.tableCell },
                      file.originalName
                    ),
                    React.createElement(
                      Text,
                      { style: this.styles.tableCell },
                      file.mimeType
                    ),
                    React.createElement(
                      Text,
                      { style: this.styles.tableCell },
                      this.formatFileSize(file.size)
                    ),
                    React.createElement(
                      Text,
                      { style: this.styles.tableCell },
                      new Date(file.createdAt).toLocaleDateString()
                    )
                  )
                )
              ),
              React.createElement(
                Text,
                { style: [this.styles.text, { marginTop: 10, fontSize: 10 }] },
                "Note: File binaries are included in JSON export format."
              )
            )
          )
      );

      // Generate PDF buffer
      const pdfBuffer = await renderToBuffer(doc);
      return pdfBuffer;
    } catch (error: any) {
      this.logger.error(`Failed to generate PDF:`, error.stack || error.message);
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  }

  /**
   * Format block content for display
   */
  private formatBlockContent(block: any): string {
    if (!block.content) return "";
    
    if (typeof block.content === "string") {
      return block.content.substring(0, 100);
    }
    
    if (block.content.text) {
      return block.content.text.substring(0, 100);
    }
    
    if (block.content.content) {
      if (Array.isArray(block.content.content)) {
        return block.content.content
          .map((item: any) => (item.text || item).toString())
          .join(" ")
          .substring(0, 100);
      }
      return block.content.content.toString().substring(0, 100);
    }
    
    return JSON.stringify(block.content).substring(0, 100);
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  }
}
