import React, { useEffect, useState } from "react";
import { useData } from "~/contexts/DataContext";
import { api } from "~/utils/api";

export default function DesignName() {
  const [editDesignName, setEditDesignName] = useState<boolean>(false);
  const { activeDesign, setActiveDesign } = useData();

  const [designName, setDesignName] = useState<string>(
    activeDesign?.name ?? "Untitled-1",
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDesignName(e.target.value);
  };

  const handleCancel = () => {
    if (!activeDesign) return;
    setDesignName(activeDesign.name);
    setEditDesignName(false);
  };

  const saveName = api.design.setName.useMutation();
  const handleSubmit = () => {
    if (!activeDesign) return;
    activeDesign.name = designName;
    setActiveDesign(activeDesign);
    setEditDesignName(false);

    console.log("activeDesign", activeDesign);
    void saveName.mutateAsync({
      id: activeDesign.designId,
      name: designName,
    });
  };

  useEffect(() => {
    setDesignName(activeDesign?.name ?? "Untitled-1");
  }, [activeDesign]);

  return (
    <input
      type="text"
      name="designName"
      id="designName"
      value={designName}
      onChange={handleChange}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur(); // This will remove focus from the input field
        }
      }}
      onClick={(e) => {
        e.currentTarget.select();
        setEditDesignName(true);
      }}
      onBlur={() => {
        setEditDesignName(false);
        handleSubmit();
      }}
      className="mt-5 block w-full rounded-md border-0 text-xl text-black placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 "
      placeholder={designName ? designName : "Set a title"}
      required
    />
  );
}
