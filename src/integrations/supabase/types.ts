export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          country: string
          created_at: string
          full_name: string | null
          id: string
          line1: string
          line2: string | null
          phone: string | null
          postal_code: string | null
          state: string | null
          type: Database["public"]["Enums"]["address_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          city: string
          country: string
          created_at?: string
          full_name?: string | null
          id?: string
          line1: string
          line2?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          type: Database["public"]["Enums"]["address_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          full_name?: string | null
          id?: string
          line1?: string
          line2?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          type?: Database["public"]["Enums"]["address_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string
          currency: string
          id: string
          product_variant_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          cart_id: string
          created_at?: string
          currency?: string
          id?: string
          product_variant_id: string
          quantity: number
          unit_price: number
        }
        Update: {
          cart_id?: string
          created_at?: string
          currency?: string
          id?: string
          product_variant_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string
          id: string
          status: Database["public"]["Enums"]["cart_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["cart_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["cart_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          parent_id: string | null
          slug: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          parent_id?: string | null
          slug?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_fk"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      collection: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string | null
        }
        Relationships: []
      }
      customer_price_tiers: {
        Row: {
          created_at: string
          profile_id: string
          tier: Database["public"]["Enums"]["price_tier_name"]
        }
        Insert: {
          created_at?: string
          profile_id: string
          tier: Database["public"]["Enums"]["price_tier_name"]
        }
        Update: {
          created_at?: string
          profile_id?: string
          tier?: Database["public"]["Enums"]["price_tier_name"]
        }
        Relationships: [
          {
            foreignKeyName: "customer_price_tiers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          note: string | null
          product_variant_id: string
          quantity: number
          reason: Database["public"]["Enums"]["inventory_reason"]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          product_variant_id: string
          quantity: number
          reason?: Database["public"]["Enums"]["inventory_reason"]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          product_variant_id?: string
          quantity?: number
          reason?: Database["public"]["Enums"]["inventory_reason"]
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          currency: string
          id: string
          order_id: string
          product_variant_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          order_id: string
          product_variant_id: string
          quantity: number
          unit_price: number
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          order_id?: string
          product_variant_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address_id: string | null
          created_at: string
          id: string
          shipping_address_id: string | null
          shipping_cost: number
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          tax: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_address_id?: string | null
          created_at?: string
          id?: string
          shipping_address_id?: string | null
          shipping_cost?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_address_id?: string | null
          created_at?: string
          id?: string
          shipping_address_id?: string | null
          shipping_cost?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_billing_address_id_fkey"
            columns: ["billing_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_shipping_address_id_fkey"
            columns: ["shipping_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_settings: {
        Row: {
          ar_cny_to_usd: number
          ar_tier1_pct: number
          ar_tier2_pct: number
          ar_tier3_pct: number
          cn_cny_to_usd: number
          cn_tier1_pct: number
          cn_tier2_pct: number
          cn_tier3_pct: number
          co_cny_to_cop: number
          co_tier1_pct: number
          co_tier2_pct: number
          co_tier3_pct: number
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          ar_cny_to_usd?: number
          ar_tier1_pct?: number
          ar_tier2_pct?: number
          ar_tier3_pct?: number
          cn_cny_to_usd?: number
          cn_tier1_pct?: number
          cn_tier2_pct?: number
          cn_tier3_pct?: number
          co_cny_to_cop?: number
          co_tier1_pct?: number
          co_tier2_pct?: number
          co_tier3_pct?: number
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          ar_cny_to_usd?: number
          ar_tier1_pct?: number
          ar_tier2_pct?: number
          ar_tier3_pct?: number
          cn_cny_to_usd?: number
          cn_tier1_pct?: number
          cn_tier2_pct?: number
          cn_tier3_pct?: number
          co_cny_to_cop?: number
          co_tier1_pct?: number
          co_tier2_pct?: number
          co_tier3_pct?: number
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          category_id: string
          product_id: string
        }
        Insert: {
          category_id: string
          product_id: string
        }
        Update: {
          category_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
        ]
      }
      product_collections: {
        Row: {
          collection_id: string
          created_at: string
          product_id: string
        }
        Insert: {
          collection_id: string
          created_at?: string
          product_id: string
        }
        Update: {
          collection_id?: string
          created_at?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_tags_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_tags_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_tags_tag_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collection"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt: string | null
          created_at: string
          id: string
          product_id: string
          sort_order: number
          url: string
        }
        Insert: {
          alt?: string | null
          created_at?: string
          id?: string
          product_id: string
          sort_order?: number
          url: string
        }
        Update: {
          alt?: string | null
          created_at?: string
          id?: string
          product_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
        ]
      }
      product_price_tiers: {
        Row: {
          currency: string
          id: string
          min_qty: number
          product_id: string
          tier: Database["public"]["Enums"]["price_tier_name"]
          unit_price: number
        }
        Insert: {
          currency?: string
          id?: string
          min_qty?: number
          product_id: string
          tier: Database["public"]["Enums"]["price_tier_name"]
          unit_price: number
        }
        Update: {
          currency?: string
          id?: string
          min_qty?: number
          product_id?: string
          tier?: Database["public"]["Enums"]["price_tier_name"]
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_price_tiers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_price_tiers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
        ]
      }
      product_translations: {
        Row: {
          country_code: string
          created_at: string
          description: string | null
          id: string
          product_id: string
          title: string
          updated_at: string
        }
        Insert: {
          country_code: string
          created_at?: string
          description?: string | null
          id?: string
          product_id: string
          title: string
          updated_at?: string
        }
        Update: {
          country_code?: string
          created_at?: string
          description?: string | null
          id?: string
          product_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_translations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_translations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variant_images: {
        Row: {
          alt: string | null
          created_at: string
          id: string
          product_variant_id: string
          sort_order: number
          url: string
        }
        Insert: {
          alt?: string | null
          created_at?: string
          id?: string
          product_variant_id: string
          sort_order?: number
          url: string
        }
        Update: {
          alt?: string | null
          created_at?: string
          id?: string
          product_variant_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variant_images_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          active: boolean
          attributes: Json
          box_height_cm: number | null
          box_length_cm: number | null
          box_weight_kg: number | null
          box_width_cm: number | null
          cbm_per_carton: number | null
          created_at: string
          currency: string
          has_battery: boolean
          has_individual_packaging: boolean
          height_cm: number | null
          id: string
          individual_packaging_price_cny: number | null
          individual_packaging_required: boolean
          is_clothing: boolean
          length_cm: number | null
          name: string | null
          option_name: string | null
          pcs_per_carton: number | null
          price: number | null
          product_id: string
          sku: string | null
          sort_order: number
          stock: number
          updated_at: string
          weight_kg: number | null
          width_cm: number | null
        }
        Insert: {
          active?: boolean
          attributes?: Json
          box_height_cm?: number | null
          box_length_cm?: number | null
          box_weight_kg?: number | null
          box_width_cm?: number | null
          cbm_per_carton?: number | null
          created_at?: string
          currency?: string
          has_battery?: boolean
          has_individual_packaging?: boolean
          height_cm?: number | null
          id?: string
          individual_packaging_price_cny?: number | null
          individual_packaging_required?: boolean
          is_clothing?: boolean
          length_cm?: number | null
          name?: string | null
          option_name?: string | null
          pcs_per_carton?: number | null
          price?: number | null
          product_id: string
          sku?: string | null
          sort_order?: number
          stock?: number
          updated_at?: string
          weight_kg?: number | null
          width_cm?: number | null
        }
        Update: {
          active?: boolean
          attributes?: Json
          box_height_cm?: number | null
          box_length_cm?: number | null
          box_weight_kg?: number | null
          box_width_cm?: number | null
          cbm_per_carton?: number | null
          created_at?: string
          currency?: string
          has_battery?: boolean
          has_individual_packaging?: boolean
          height_cm?: number | null
          id?: string
          individual_packaging_price_cny?: number | null
          individual_packaging_required?: boolean
          is_clothing?: boolean
          length_cm?: number | null
          name?: string | null
          option_name?: string | null
          pcs_per_carton?: number | null
          price?: number | null
          product_id?: string
          sku?: string | null
          sort_order?: number
          stock?: number
          updated_at?: string
          weight_kg?: number | null
          width_cm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          agent_profile_id: string | null
          brand: string | null
          bx_code: string | null
          collection: string | null
          created_at: string
          description: string | null
          discountable: boolean
          id: string
          material: string | null
          name: string
          slug: string | null
          status: Database["public"]["Enums"]["product_status"]
          subtitle: string | null
          supplier_link: string | null
          supplier_model: string | null
          type: string | null
          updated_at: string
          verified_product: boolean
          verified_video: boolean
          video_url: string | null
        }
        Insert: {
          active?: boolean
          agent_profile_id?: string | null
          brand?: string | null
          bx_code?: string | null
          collection?: string | null
          created_at?: string
          description?: string | null
          discountable?: boolean
          id?: string
          material?: string | null
          name: string
          slug?: string | null
          status?: Database["public"]["Enums"]["product_status"]
          subtitle?: string | null
          supplier_link?: string | null
          supplier_model?: string | null
          type?: string | null
          updated_at?: string
          verified_product?: boolean
          verified_video?: boolean
          video_url?: string | null
        }
        Update: {
          active?: boolean
          agent_profile_id?: string | null
          brand?: string | null
          bx_code?: string | null
          collection?: string | null
          created_at?: string
          description?: string | null
          discountable?: boolean
          id?: string
          material?: string | null
          name?: string
          slug?: string | null
          status?: Database["public"]["Enums"]["product_status"]
          subtitle?: string | null
          supplier_link?: string | null
          supplier_model?: string | null
          type?: string | null
          updated_at?: string
          verified_product?: boolean
          verified_video?: boolean
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_agent_profile_id_fkey"
            columns: ["agent_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      promotion_categories: {
        Row: {
          category_id: string
          promotion_id: string
        }
        Insert: {
          category_id: string
          promotion_id: string
        }
        Update: {
          category_id?: string
          promotion_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotion_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_categories_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      promotion_products: {
        Row: {
          product_id: string
          promotion_id: string
        }
        Insert: {
          product_id: string
          promotion_id: string
        }
        Update: {
          product_id?: string
          promotion_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotion_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_products_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          name: string
          starts_at: string | null
          type: Database["public"]["Enums"]["discount_type"]
          updated_at: string
          value: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          name: string
          starts_at?: string | null
          type: Database["public"]["Enums"]["discount_type"]
          updated_at?: string
          value: number
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          name?: string
          starts_at?: string | null
          type?: Database["public"]["Enums"]["discount_type"]
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      variant_price_tiers: {
        Row: {
          created_at: string
          currency: string
          id: string
          min_qty: number
          product_variant_id: string
          tier: Database["public"]["Enums"]["price_tier_name"]
          unit_price: number
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          min_qty?: number
          product_variant_id: string
          tier: Database["public"]["Enums"]["price_tier_name"]
          unit_price: number
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          min_qty?: number
          product_variant_id?: string
          tier?: Database["public"]["Enums"]["price_tier_name"]
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_vpt_variant"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      products_public: {
        Row: {
          active: boolean | null
          brand: string | null
          bx_code: string | null
          collection: string | null
          created_at: string | null
          description: string | null
          discountable: boolean | null
          id: string | null
          material: string | null
          name: string | null
          slug: string | null
          status: Database["public"]["Enums"]["product_status"] | null
          subtitle: string | null
          type: string | null
          updated_at: string | null
          verified_product: boolean | null
          verified_video: boolean | null
          video_url: string | null
        }
        Insert: {
          active?: boolean | null
          brand?: string | null
          bx_code?: string | null
          collection?: string | null
          created_at?: string | null
          description?: string | null
          discountable?: boolean | null
          id?: string | null
          material?: string | null
          name?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["product_status"] | null
          subtitle?: string | null
          type?: string | null
          updated_at?: string | null
          verified_product?: boolean | null
          verified_video?: boolean | null
          video_url?: string | null
        }
        Update: {
          active?: boolean | null
          brand?: string | null
          bx_code?: string | null
          collection?: string | null
          created_at?: string | null
          description?: string | null
          discountable?: boolean | null
          id?: string | null
          material?: string | null
          name?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["product_status"] | null
          subtitle?: string | null
          type?: string | null
          updated_at?: string | null
          verified_product?: boolean | null
          verified_video?: boolean | null
          video_url?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin_or_agent: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      address_type: "shipping" | "billing"
      app_role: "admin" | "user" | "agent" | "customer"
      cart_status: "active" | "abandoned" | "converted"
      discount_type: "percentage" | "fixed"
      inventory_reason: "adjustment" | "purchase" | "sale" | "return"
      order_status: "pending" | "paid" | "fulfilled" | "cancelled" | "refunded"
      price_tier_name: "inicial" | "mayorista" | "distribuidor"
      product_status: "draft" | "published"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      address_type: ["shipping", "billing"],
      app_role: ["admin", "user", "agent", "customer"],
      cart_status: ["active", "abandoned", "converted"],
      discount_type: ["percentage", "fixed"],
      inventory_reason: ["adjustment", "purchase", "sale", "return"],
      order_status: ["pending", "paid", "fulfilled", "cancelled", "refunded"],
      price_tier_name: ["inicial", "mayorista", "distribuidor"],
      product_status: ["draft", "published"],
    },
  },
} as const
