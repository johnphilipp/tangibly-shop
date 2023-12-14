import React, { useEffect, useState } from "react";
import { useData } from "~/contexts/DataContext";
import { api } from "~/utils/api";
import Button from "./Button";

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
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeDesign) return;
    activeDesign.name = designName;
    setActiveDesign(activeDesign);
    setEditDesignName(false);
    e.currentTarget.reset();

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
    <div className="mt-4 rounded-xl border pl-2">
      <form onSubmit={handleSubmit} className="flex items-center space-x-4 p-2">
        <input
          type="text"
          name="designName"
          id="designName"
          value={designName}
          onChange={handleChange}
          onClick={(e) => {
            e.currentTarget.select();
            setEditDesignName(true);
          }}
          className="block w-full rounded-md border-0 text-xl text-black placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 "
          placeholder={designName ? designName : "Set a title"}
          required
        />
        {editDesignName && (
          <>
            <Button
              type="submit"
              className="bg-black text-white hover:bg-gray-700"
            >
              Save
            </Button>
            <Button onClick={handleCancel}>Cancel</Button>
          </>
        )}
      </form>
    </div>
  );
}
