"use client";
import { useState } from "react";
import MediaLibrary from "./MediaLibrary";
export default function BlockEditor({
  value = [],
  onChange,
  specs = false,
}: {
  value?: any[];
  onChange: (value: any[]) => void;
  specs?: boolean;
}) {
  const [pick, setPick] = useState<number | null>(null);
  const update = (i: number, patch: any) =>
    onChange(value.map((b, j) => (i === j ? { ...b, ...patch } : b)));
  const move = (i: number, delta: number) => {
    const next = [...value];
    [next[i], next[i + delta]] = [next[i + delta], next[i]];
    onChange(next);
  };
  return (
    <div className="cms-blocks">
      {value.map((block, i) => (
        <div className="cms-block" key={i}>
          <div className="cms-actions">
            <strong>
              {specs ? `Thông số ${i + 1}` : `Khối ${i + 1}: ${block.type}`}
            </strong>
            <button
              type="button"
              disabled={i === 0}
              onClick={() => move(i, -1)}
            >
              Lên
            </button>
            <button
              type="button"
              disabled={i === value.length - 1}
              onClick={() => move(i, 1)}
            >
              Xuống
            </button>
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => i !== j))}
            >
              Bỏ khối
            </button>
          </div>
          {specs ? (
            <div className="cms-two">
              <label>
                Tên thông số
                <input
                  value={block.name || ""}
                  onChange={(e) => update(i, { name: e.target.value })}
                />
              </label>
              <label>
                Giá trị
                <input
                  value={block.value || ""}
                  onChange={(e) => update(i, { value: e.target.value })}
                />
              </label>
            </div>
          ) : block.type === "image" ? (
            <>
              <button type="button" onClick={() => setPick(i)}>
                Chọn ảnh
              </button>
              {block.src && (
                <img
                  className="cms-image-preview"
                  src={block.src}
                  alt={block.alt || ""}
                />
              )}
              <label>
                Mô tả ảnh
                <input
                  value={block.alt || ""}
                  onChange={(e) => update(i, { alt: e.target.value })}
                />
              </label>
            </>
          ) : block.type === "table" ? (
            <>
              <p>Mỗi dòng là một hàng, các cột cách nhau bằng dấu |.</p>
              <textarea
                aria-label={`Bảng khối ${i + 1}`}
                rows={5}
                value={(block.rows || [])
                  .map((row: string[]) => row.join(" | "))
                  .join("\n")}
                onChange={(e) =>
                  update(i, {
                    rows: e.target.value
                      .split("\n")
                      .map((row) => row.split("|").map((cell) => cell.trim())),
                  })
                }
              />
            </>
          ) : (
            <textarea
              aria-label={`Nội dung khối ${i + 1}`}
              rows={block.type === "heading" ? 2 : 5}
              value={block.text || ""}
              onChange={(e) => update(i, { text: e.target.value })}
            />
          )}
        </div>
      ))}
      <div className="cms-actions">
        {specs ? (
          <button
            type="button"
            onClick={() => onChange([...value, { name: "", value: "" }])}
          >
            Thêm thông số
          </button>
        ) : (
          ["paragraph", "heading", "image", "table"].map((type) => (
            <button
              type="button"
              key={type}
              onClick={() =>
                onChange([
                  ...value,
                  {
                    type,
                    text: "",
                    ...(type === "table" ? { rows: [["", ""]] } : {}),
                  },
                ])
              }
            >
              Thêm{" "}
              {
                {
                  paragraph: "đoạn văn",
                  heading: "tiêu đề",
                  image: "ảnh",
                  table: "bảng",
                }[type]
              }
            </button>
          ))
        )}
      </div>
      {pick !== null && (
        <MediaLibrary
          onClose={() => setPick(null)}
          onSelect={(url) => {
            update(pick, { src: url });
            setPick(null);
          }}
        />
      )}
    </div>
  );
}
