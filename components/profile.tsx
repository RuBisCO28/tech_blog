import React from "react";
import Link from "next/link";
import Image from "next/image";

const Profile: React.FC = () => {
  return (
    <div className="flex flex-col	items-center">
      <picture>
        <source srcSet="/images/profile.jpg" />
        <Image
          src="/images/silver_lining.jpg"
          alt="profile"
          className="object-cover"
          width={150}
          height={100}
        />
      </picture>
      <p className="text-gray-500 mt-4">
        Tech blog /{" "}
        <Link href="/about">
          <a className="underline">about</a>
        </Link>
      </p>
    </div>
  );
};

export default Profile;
