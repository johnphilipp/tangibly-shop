import React, { useEffect, useState } from "react";
import { BiEdit } from "react-icons/bi";
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
    <form
      onSubmit={handleSubmit}
      className="flex max-w-sm items-center space-x-4"
    >
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
        className="mt-5 block w-full rounded-md border-0 text-xl text-black placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 "
        placeholder={designName ? designName : "Set a title"}
        required
      />
      {editDesignName ? (
        <>
          <button
            type="submit"
            className="rounded bg-blue-500 pl-2 pr-2 text-white"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="rounded bg-gray-600 pl-2 pr-2 text-white"
          >
            Cancel
          </button>
        </>
      ) : (
        <></>
      )}
    </form>
  );
}
